import React, { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyCU28rDOzHnMzfDS4z36iT6x5gckDxgZzY",
    authDomain: "ujaas-aroma.firebaseapp.com",
    projectId: "ujaas-aroma",
    storageBucket: "ujaas-aroma.firebasestorage.app",
    messagingSenderId: "1006780633968",
    appId: "1:1006780633968:web:ac0a6da25c0aebf87935b5",
    measurementId: "G-89GJELF98M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);


export default function AddProductWebForm() {
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [discountPrice, setDiscountPrice] = useState("");
    const [sku, setSku] = useState("");
    const [weight, setWeight] = useState("");
    const [ribbon, setRibbon] = useState("");
    const [size, setSize] = useState("M");
    const [color, setColor] = useState("Red");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        setImages(Array.from(e.target.files));
    };

    const uploadImage = async (file, index) => {
        const fileRef = ref(storage, `products/${Date.now()}_${index}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        return url;
    };

    const saveProduct = async (e) => {
        e.preventDefault();

        if (!title || !price) {
            alert("Title and Price are required.");
            return;
        }

        setLoading(true);

        try {
            const uploadedUrls = [];
            for (let i = 0; i < images.length; i++) {
                const url = await uploadImage(images[i], i);
                uploadedUrls.push(url);
            }

            await addDoc(collection(db, "products"), {
                title,
                subtitle,
                description,
                ribbon: ribbon || null,
                images: uploadedUrls,
                price: parseFloat(price),
                discountPrice: discountPrice ? parseFloat(discountPrice) : null,
                SKU: sku || null,
                weight: weight ? parseInt(weight) : null,
                options: [
                    { name: "Size", value: size },
                    { name: "Color", value: color },
                ],
                createdAt: serverTimestamp(),
            });

            alert("✅ Product saved successfully!");

            setTitle("");
            setSubtitle("");
            setDescription("");
            setPrice("");
            setDiscountPrice("");
            setSku("");
            setWeight("");
            setRibbon("");
            setImages([]);
            setSize("M");
            setColor("Red");
        } catch (error) {
            console.error("Error saving product:", error);
            alert("❌ Error saving product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Add New Product</h2>
            <form onSubmit={saveProduct} style={styles.form}>

                <div style={styles.row}>
                    <div style={styles.col}>
                        <label style={styles.label}>Title *</label>
                        <input
                            placeholder="Product title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.col}>
                        <label style={styles.label}>Subtitle</label>
                        <input
                            placeholder="Subtitle"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                </div>

                <div style={styles.row}>
                    <div style={styles.col}>
                        <label style={styles.label}>Ribbon</label>
                        <input
                            placeholder="Ribbon"
                            value={ribbon}
                            onChange={(e) => setRibbon(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.col}>
                        <label style={styles.label}>SKU</label>
                        <input
                            placeholder="SKU"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                </div>

                <label style={styles.label}>Description</label>
                <textarea
                    placeholder="Product description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.textarea}
                />

                <div style={styles.row}>
                    <div style={styles.col}>
                        <label style={styles.label}>Price *</label>
                        <input
                            type="number"
                            placeholder="Price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.col}>
                        <label style={styles.label}>Discount Price</label>
                        <input
                            type="number"
                            placeholder="Discount Price"
                            value={discountPrice}
                            onChange={(e) => setDiscountPrice(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                </div>

                <div style={styles.row}>
                    <div style={styles.col}>
                        <label style={styles.label}>Weight (gms)</label>
                        <input
                            type="number"
                            placeholder="Weight"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.col}>
                        <label style={styles.label}>Size</label>
                        <select
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            style={styles.select}
                        >
                            <option value="S">Small</option>
                            <option value="M">Medium</option>
                            <option value="L">Large</option>
                        </select>
                    </div>
                </div>

                <div style={styles.row}>
                    <div style={styles.col}>
                        <label style={styles.label}>Color</label>
                        <select
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            style={styles.select}
                        >
                            <option value="Red">Red</option>
                            <option value="Blue">Blue</option>
                            <option value="Black">Black</option>
                        </select>
                    </div>
                    <div style={styles.col}>
                        <label style={styles.label}>Upload Images</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            style={styles.input}
                        />
                    </div>
                </div>

                <div style={styles.previewContainer}>
                    {images.map((img, i) => (
                        <img
                            key={i}
                            src={URL.createObjectURL(img)}
                            alt={`preview-${i}`}
                            style={styles.previewImage}
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        ...styles.button,
                        ...(loading ? styles.buttonDisabled : {}),
                    }}
                >
                    {loading ? "Saving..." : "Save Product"}
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        padding: "40px 20px",
        maxWidth: "80%",
        margin: "50px auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#ffffff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        borderRadius: "12px",
    },
    heading: {
        textAlign: "center",
        fontSize: "26px",
        fontWeight: "700",
        marginBottom: "30px",
        color: "#222",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    row: {
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
    },
    col: {
        flex: 1,
        minWidth: "200px",
        display: "flex",
        flexDirection: "column",
    },
    label: {
        marginBottom: "6px",
        fontSize: "14px",
        fontWeight: "600",
        color: "#444",
    },
    input: {
        padding: "12px 16px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        outline: "none",
    },
    textarea: {
        padding: "12px 16px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        minHeight: "100px",
        resize: "vertical",
        outline: "none",
    },
    select: {
        padding: "12px 16px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "1px solid #dcdcdc",
        appearance: "none",
        backgroundColor: "#fff",
        backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"%23999\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
        backgroundRepeat: "no-repeat",
        backgroundPositionX: "calc(100% - 12px)",
        backgroundPositionY: "center",
    },
    button: {
        padding: "14px",
        fontSize: "16px",
        backgroundColor: "#1a73e8",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        transition: "background-color 0.3s ease",
    },
    buttonDisabled: {
        backgroundColor: "#9bbcf3",
        cursor: "not-allowed",
    },
    previewContainer: {
        display: "flex",
        gap: "10px",
        overflowX: "auto",
        paddingBottom: "10px",
    },
    previewImage: {
        width: "80px",
        height: "80px",
        objectFit: "cover",
        borderRadius: "8px",
        border: "1px solid #ccc",
    },
    label: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#333",
    },
    heading: {
        textAlign: "center",
        fontSize: "24px",
        fontWeight: "700",
        marginBottom: "30px",
        color: "#222",
    },
};
