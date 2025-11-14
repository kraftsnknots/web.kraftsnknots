import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal, Button, Image, Pagination, Spinner } from "react-bootstrap";
import {
  IoBagAddOutline,
  IoBagRemoveOutline,
} from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromWishlist,
  addToCart,
  removeFromCart,
} from "../features/cartWishlistSlice";
import "./styles/Accounts.css";

export default function Wishlist() {
  const { cart, wishlist } = useSelector((state) => state.cartWishlist);
  const dispatch = useDispatch();

  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "title",
    direction: "asc",
  });

  // 🧾 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(wishlist.length / itemsPerPage);

  // 🕓 Track loading / added state
  const [addingItemId, setAddingItemId] = useState(null);

  // 🔽 Sorting logic
  const sortedWishlist = useMemo(() => {
    const sorted = [...wishlist];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        if (sortConfig.key === "title") {
          return sortConfig.direction === "asc"
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        } else if (sortConfig.key === "price") {
          return sortConfig.direction === "asc"
            ? a.price - b.price
            : b.price - a.price;
        }
        return 0;
      });
    }
    return sorted;
  }, [wishlist, sortConfig]);

  // 🧩 Current page items
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedWishlist.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedWishlist, currentPage]);

  const openItemDetails = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const isInCart = (itemId) => cart.some((c) => c.id === itemId);

  // 🛍 Add with loading animation
  const handleAddToCart = (item) => {
    setAddingItemId(item.id);
    setTimeout(() => {
      dispatch(addToCart({ ...item, quantity: 1 }));
      setAddingItemId(null);
    }, 1000); // simulate 1s delay for feedback
  };

  return (
    <motion.div
      className="orders-card"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* ---- Wishlist Table ---- */}
      <div className="d-flex flex-column justify-content-between align-items-start mb-2">
        <h3>My Wishlist</h3>

        <div className="wishlist-sorted-buttons d-flex align-items-center justify-content-end">
          <Button
            variant={sortConfig.key === "title" ? "dark" : "light"}
            onClick={() => handleSort("title")}
          >
            Sort by Name{" "}
            {sortConfig.key === "title" &&
              (sortConfig.direction === "asc" ? "↑" : "↓")}
          </Button>
          <Button
            variant={sortConfig.key === "price" ? "dark" : "light"}
            className="ms-2"
            onClick={() => handleSort("price")}
          >
            Sort by Price{" "}
            {sortConfig.key === "price" &&
              (sortConfig.direction === "asc" ? "↑" : "↓")}
          </Button>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <p className="no-orders">Your wishlist is empty 💔</p>
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
                  <th></th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Tag</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => {
                  const inCart = isInCart(item.id);
                  const isLoading = addingItemId === item.id;

                  return (
                    <tr
                      // key={item.id}
                      // onClick={() => openItemDetails(item)}
                      // style={{ cursor: "pointer" }}
                    >
                      <td onClick={() => dispatch(removeFromWishlist(item.id))}><i class="bi bi-hearts" style={{fontSize:25, cursor:'pointer', color:'red'}}></i></td>
                      <td className="d-flex align-items-center">
                        <Image
                          src={item.images?.[0]}
                          alt={item.title}
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 8,
                            marginRight: 8,
                            objectFit: "cover",
                          }}
                        />
                        <span>{item.title}</span>
                      </td>
                      <td>{item.category || "—"}</td>
                      <td>
                        {item.discountPrice && (
                          <s style={{ color: "tomato" }}>
                            ₹ {item.price?.toFixed(2)}
                          </s>
                        )}
                        &nbsp;&nbsp;
                        <strong style={{ color: "green" }}>
                          ₹ {item.discountPrice || item.price?.toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <span className="status-chip processing d-flex justify-content-center" style={{ width: 80 }}>
                          {item.ribbon || "Featured"}
                        </span>
                      </td>
                      <td>
                        {inCart ? (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(removeFromCart(item.id));
                            }}
                          >
                            <IoBagRemoveOutline /> Remove from Cart
                          </Button>
                        ) : (
                          <Button
                            variant="outline-success"
                            size="sm"
                            disabled={isLoading}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(item);
                            }}
                          >
                            {isLoading ? (
                              <>
                                <Spinner
                                  animation="border"
                                  size="sm"
                                  className="me-2"
                                />
                                Adding...
                              </>
                            ) : (
                              <>
                                <IoBagAddOutline /> Add to Cart
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </motion.table>
          </AnimatePresence>

          {/* 🌟 Pagination */}
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

      {/* ---- Item Details Modal ---- */}
      {selectedItem && (
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          size="md"
          backdrop="static"
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold">{selectedItem.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="order-details-modal">
              <div className="d-flex justify-content-center mb-3">
                <Image
                  src={selectedItem.images?.[0]}
                  alt={selectedItem.title}
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: 10,
                    objectFit: "cover",
                  }}
                />
              </div>
              <p className="text-muted">{selectedItem.subtitle}</p>
              <p>
                <strong>Price:</strong> ₹
                {selectedItem.discountPrice || selectedItem.price}
              </p>
              <p>
                <strong>Tag:</strong> {selectedItem.ribbon || "Featured"}
              </p>
              <p>
                <strong>Category:</strong> {selectedItem.category || "—"}
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            {isInCart(selectedItem.id) ? (
              <Button
                variant="danger"
                onClick={() => {
                  dispatch(removeFromCart(selectedItem.id));
                  setShowModal(false);
                }}
              >
                <IoBagRemoveOutline className="me-2" />
                Remove from Cart
              </Button>
            ) : addingItemId === selectedItem.id ? (
              <Button variant="dark" disabled>
                <Spinner animation="border" size="sm" className="me-2" />
                Adding...
              </Button>
            ) : (
              <Button
                variant="dark"
                onClick={() => {
                  handleAddToCart(selectedItem);
                  setTimeout(() => setShowModal(false), 1000);
                }}
              >
                <IoBagAddOutline className="me-2" />
                Add to Cart
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      )}
    </motion.div>
  );
}
