import "./App.css";
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "./firebase";

const ExampleComponent = () => {
  const [data, setData] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedServiceName, setSelectedServiceName] = useState("");
  const [payments, setPayments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  console.log(process.env);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch services data
        const snapshot = await db.collection("services").get();
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(items);

        // Fetch payment history data and sort by dateOfPayment (descending)
        const paymentsSnapshot = await db
          .collection("payments")
          .orderBy("dateOfPayment", "desc")
          .get();
        const paymentsData = paymentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPayments(paymentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const openModal = (serviceId, serviceName) => {
    setModalIsOpen(true);
    setSelectedServiceId(serviceId);
    setSelectedServiceName(serviceName);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedServiceId(null);
    setSelectedServiceName("");
    setPaymentAmount("");
    setSelectedDate(new Date());
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    try {
      // 1. Update Payments collection
      const paymentRef = await db.collection("payments").add({
        dateOfPayment: selectedDate,
        amount: parseFloat(paymentAmount),
        service: selectedServiceId,
        serviceName: selectedServiceName,
      });

      // 2. Deduct payment amount from Service collection total
      const serviceRef = db.collection("services").doc(selectedServiceId);
      const serviceDoc = await serviceRef.get();

      if (!serviceDoc.exists) {
        throw new Error("Service document not found.");
      }

      const currentTotal = serviceDoc.data().total;
      const updatedTotal = currentTotal - parseFloat(paymentAmount);

      await serviceRef.update({
        total: updatedTotal,
      });

      console.log("Payment added successfully!");
      closeModal();

      // Optional: Refresh data after update
      const updatedSnapshot = await db.collection("services").get();
      const updatedItems = updatedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(updatedItems);

      // Refresh payment history and sort by dateOfPayment (descending)
      const updatedPaymentsSnapshot = await db
        .collection("payments")
        .orderBy("dateOfPayment", "desc")
        .get();
      const updatedPaymentsData = updatedPaymentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPayments(updatedPaymentsData);
    } catch (error) {
      console.error("Error adding payment:", error);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      await db.collection("payments").doc(paymentId).delete();
      console.log("Payment deleted successfully!");

      // Refresh payment history after deletion and sort by dateOfPayment (descending)
      const updatedPaymentsSnapshot = await db
        .collection("payments")
        .orderBy("dateOfPayment", "desc")
        .get();
      const updatedPaymentsData = updatedPaymentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPayments(updatedPaymentsData);
    } catch (error) {
      console.error("Error deleting payment:", error);
    }
  };

  return (
    <div>
      <div className="container">
        <h1>Services and total prices</h1>
      </div>
      <div className="wrapper container">
        {data.map((item) => (
          <div className="cards-wrapper" key={item.id}>
            <ul>
              <li>
                <p>{item.service}</p>
              </li>
              <li>Total: {item.total}</li>
              <div>
                <button
                  className="button-5"
                  onClick={() => openModal(item.id, item.service)}>
                  Add payment
                </button>
              </div>
            </ul>
          </div>
        ))}
      </div>

      {/* Modal for payment */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add Payment Modal">
        <h2>Add Payment for {selectedServiceName}</h2>
        <form onSubmit={handlePaymentSubmit}>
          <label>
            Amount:
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
            />
          </label>
          <label>
            Date of Payment:
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="MM/dd/yyyy"
            />
          </label>
          <button type="submit">Submit Payment</button>
          <button type="button" onClick={closeModal}>
            Cancel
          </button>
        </form>
      </Modal>
      <br />
      <hr />
      <br />
      {/* Display Payment History */}
      <div className="payment-history container">
        <div className="payment-history-wrapper">
          <h2>Payment History</h2>
          <div className="payment-history-card">
            <table>
              <thead>
                <tr>
                  <th>Date of Payment</th>
                  <th>Amount</th>
                  <th>Service</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      {payment.dateOfPayment.toDate().toLocaleDateString()}
                    </td>
                    <td>₱{payment.amount}</td>
                    <td>{payment.serviceName}</td>
                    <td>
                      <button
                        className="button-24"
                        onClick={() => handleDeletePayment(payment.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleComponent;
