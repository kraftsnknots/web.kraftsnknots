// src/pages/Accounts.jsx
import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form, Image } from "react-bootstrap";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage"; // 👈 helper (next step)
import Swal from "sweetalert2";
import dummy from "../assets/images/dummy_profile_picture.png"

import { logoutUser } from "../features/userSlice";
import {
  listenToUserProfile,
  updateUserProfile,
  clearProfile,
} from "../features/profileSlice";
import MyOrders from "./MyOrders";
import CustomerCare from "./CustomerCare";
import Wishlist from "./Wishlist";
import ShippingAddresses from "./shippingAddresses";
import "./styles/Accounts.css";
import "./styles/AccountSkeleton.css";

export default function Accounts() {
  const { user } = useSelector((state) => state.user);
  const { data: profile, status } = useSelector((s) => s.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [link, setLink] = useState("my-orders");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", removePhoto: false });
  const [saving, setSaving] = useState(false);

  // Cropper state
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedBlob, setCroppedBlob] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    if (user?.uid) dispatch(listenToUserProfile(user.uid));
    return () => dispatch(clearProfile());
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  const openEditModal = () => {
    setEditForm({
      name: profile.name || "",
      phone: profile.phone || "",
    });
    setShowEditModal(true);
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // 📸 Load image and open cropper
  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  // ✅ Crop and create blob
  const handleCropSave = async () => {
    try {
      const { file } = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedBlob(file);
      setShowCropper(false);
      Swal.fire("Success", "Photo cropped successfully!", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to crop photo", "error");
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      await dispatch(
        updateUserProfile({
          uid: user.uid,
          name: editForm.name.trim(),
          phone: editForm.phone.trim(),
          croppedBlob,
          removePhoto: editForm.removePhoto, // 👈
        })
      );

      Swal.fire("Updated!", "Profile updated successfully.", "success");
      setShowEditModal(false);
    } catch (err) {
      Swal.fire("Error", "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || status === "idle") {
    return (
      <div className="profile-skeleton-container">
        <div className="profile-skeleton-card">
          <div className="skeleton skeleton-photo" />
          <div className="skeleton skeleton-name" />
          <div className="skeleton skeleton-email" />
          <div className="skeleton skeleton-phone" />
          <div className="skeleton skeleton-btn primary" />
          <div className="skeleton skeleton-btn secondary" />
        </div>
      </div>
    );
  }

  const handleDeletePhoto = () => {
    setCroppedBlob(null);
    setImageSrc(null);

    // Mark intent to delete existing photo
    setEditForm((prev) => ({
      ...prev,
      removePhoto: true,
    }));

    Swal.fire("Removed", "Profile photo will be removed after saving.", "info");
  };


  return (
    <motion.div
      className="profile-layout"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* ---- Profile Card ---- */}
      <div className="profile-card">
        <div className="profile-section">
          <div className="profile-image-section">
            <img
              src={
                profile.photoURL || dummy
              }
              alt="Profile"
              className="profile-avatar"
            />
          </div>
          <div className="profile-details-section">
            <span className="profile-email">
              <i className="bi bi-person"></i><span>:</span> {profile.name}
            </span>
            <span className="profile-email">
              <i className="bi bi-envelope"></i><span>:</span> {profile.email}
            </span>
            {profile.phone && (
              <span className="profile-phone">
                <i className="bi bi-telephone"></i><span>:</span> {profile.phone}
              </span>
            )}
          </div>
          <Button className="profile-edit-btn" variant="link" onClick={openEditModal}>
            <i className="bi bi-pencil"></i>
          </Button>
        </div>

        {/* ---- Sidebar ---- */}
        <div className="profile-sidebar">
          <ul className="profile-menu">
            <li className={`menu-item ${link === "my-orders" && "active"}`} onClick={() => setLink("my-orders")}>
              <i className="bi bi-file-earmark-text"></i> <span><text>My</text> Orders</span>
            </li>
            <li className={`menu-item ${link === "ccare" && "active"}`} onClick={() => setLink("ccare")}>
              <i className="bi bi-headset"></i> <span>Contact <text>Us</text></span>
            </li>
            <li className={`menu-item ${link === "saddresses" && "active"}`} onClick={() => setLink("saddresses")}>
              <i className="bi bi-pin-map"></i> <span>Addresses</span>
            </li>
            <li className={`menu-item ${link === "wishlist" && "active"}`} onClick={() => setLink("wishlist")}>
              <i className="bi bi-heart"></i> <span>Wishlist</span>
            </li>
            <li className="menu-item logout" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> <span>Logout</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ---- Dynamic Section ---- */}
      {link === "my-orders" ? (
        <MyOrders />
      ) : link === "ccare" ? (
        <CustomerCare />
      ) : link === "saddresses" ? (
        <ShippingAddresses />
      ) : link === "wishlist" ? (
        <Wishlist />
      ) : (
        ""
      )}

      {/* ---- Edit Profile Modal ---- */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="d-flex flex-column align-items-center mb-3">
              <div className="position-relative d-flex flex-column justify-content-start align-item-center gap-0 mb-3">
                <Image
                  src={
                    croppedBlob
                      ? URL.createObjectURL(croppedBlob)
                      : profile.photoURL || dummy
                  }
                  // width={200}
                  height={200}
                  className="edit-image"
                />
                {(profile.photoURL || croppedBlob) && (
                  <Button variant="danger" onClick={handleDeletePhoto} className="edit-delete-btn">Delete</Button>
                )}
              </div>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
              />



            </div>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="dark" disabled={saving} onClick={handleSaveProfile}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ---- Cropper Modal ---- */}
      <Modal show={showCropper} onHide={() => setShowCropper(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crop Your Photo</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: 400, position: "relative" }}>
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              // cropShape="round"
              cropShape="rect"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCropper(false)}>
            Cancel
          </Button>
          <Button variant="dark" onClick={handleCropSave}>
            Crop & Save
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
}
