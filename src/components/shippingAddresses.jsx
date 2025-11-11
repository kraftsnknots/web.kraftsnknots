// src/pages/ShippingAddresses.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  listenToUserShippingAddresses,
  clearAddresses,
  updateShippingAddress,
  deleteShippingAddress,
} from "../features/shippingSlice";
import { Modal, Button, Form, Pagination } from "react-bootstrap";
import Swal from "sweetalert2";
import "./styles/Accounts.css";

export default function ShippingAddresses() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.user);
  const { list: addresses, status } = useSelector((s) => s.shippingAddresses);

  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 🔁 Real-time listener
  useEffect(() => {
    if (user?.uid) {
      dispatch(listenToUserShippingAddresses(user.uid));
    }
    return () => {
      dispatch(clearAddresses());
    };
  }, [user, dispatch]);

  const filtered = useMemo(() => {
    if (filterStatus === "all") return addresses;
    if (filterStatus === "recent")
      return addresses.filter(
        (a) =>
          a.updatedAt?.seconds >
          Date.now() / 1000 - 30 * 24 * 60 * 60 // last 30 days
      );
    return addresses;
  }, [addresses, filterStatus]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const valA = new Date(a.updatedAt?.seconds * 1000 || 0);
      const valB = new Date(b.updatedAt?.seconds * 1000 || 0);
      return valB - valA;
    });
    return arr;
  }, [filtered]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const currentItems = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openEditModal = (addr) => {
    console.log(addr);
    
    setSelectedAddress(addr);
    setEditForm(addr);
    setShowModal(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await dispatch(
        updateShippingAddress({
          id: selectedAddress.id,
          updatedData: {
            ...editForm,
            updatedAt: new Date(),
          },
        })
      );
      Swal.fire("Updated!", "Address has been updated successfully.", "success");
      setShowModal(false);
    } catch (err) {
      Swal.fire("Error", "Failed to update address.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this address?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (confirm.isConfirmed) {
      await dispatch(deleteShippingAddress(id));
      Swal.fire("Deleted!", "Address has been deleted.", "success");
    }
  };

  if (status === "loading" || status === "idle") {
    return (
      <div className="profile-skeleton-container">
        <div className="profile-skeleton-orders">
          <div className="skeleton skeleton-title" />
          <div className="skeleton-tab-container">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton skeleton-tab" />
            ))}
          </div>
          <div className="skeleton-table">
            {[1, 2].map((row) => (
              <div key={row} className="skeleton-table-row">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="skeleton skeleton-col short" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="orders-card"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="d-flex flex-column justify-content-between align-items-start mb-1">
        <h3>My Shipping Addresses</h3>
        {addresses.length > 0 && (
          <div className="sorted-buttons d-flex align-items-center justify-content-end">
            <Button
              variant={filterStatus === "all" ? "dark" : "light"}
              onClick={() => setFilterStatus("all")}
            >
              <text style={{ color: filterStatus === "all" ? "#00ff00" : "#FF3131" }}>
                ⬤
              </text>{" "}
              All
            </Button>
            <Button
              variant={filterStatus === "recent" ? "dark" : "light"}
              onClick={() => setFilterStatus("recent")}
            >
              <text style={{ color: filterStatus === "recent" ? "#00ff00" : "#FF3131" }}>
                ⬤
              </text>{" "}
              Recent
            </Button>
          </div>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="no-orders">No addresses found.</p>
      ) : (
        <div className="orders-table-container">
          <AnimatePresence mode="wait">
            <motion.table
              key={currentPage}
              className="orders-table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Postal Code</th>
                  <th>Country</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((addr) => (
                  <tr>
                    <td>{addr.name}</td>
                    <td>{addr.address}</td>
                    <td>{addr.city}</td>
                    <td>{addr.state}</td>
                    <td>{addr.postalCode}</td>
                    <td>{addr.country}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-dark"
                        className="me-2"
                        onClick={() => openEditModal(addr)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(addr.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </motion.table>
          </AnimatePresence>

          {totalPages > 1 && (
            <motion.div
              className="d-flex justify-content-center mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Pagination>
                <Pagination.First
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                />
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                />
                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                />
                <Pagination.Last
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                />
              </Pagination>
            </motion.div>
          )}
        </div>
      )}

      {/* 🧾 Edit Modal */}
      {selectedAddress && (
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Address</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {["name", "address", "city", "state", "postalCode", "country"].map(
                (field) => (
                  <Form.Group key={field} className="mb-3">
                    <Form.Label className="text-capitalize">{field}</Form.Label>
                    <Form.Control
                      type="text"
                      value={editForm[field] || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                    />
                  </Form.Group>
                )
              )}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant="dark"
              disabled={saving}
              onClick={handleSaveEdit}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </motion.div>
  );
}
