"use client"

import styles from "./mint.module.css"
import { useRouter } from "next/navigation";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import marketplace from "./../marketplace.json";
import { ethers } from "ethers";
import { WalletContext } from "@/context/wallet";
import { useState, useContext } from "react";
import Navbar from "../components/Navbar";

export default function MINT() {
  const [formParams, updateFormParams] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [fileURL, setFileURL] = useState();
  const [message, updateMessage] = useState("");
  const [btnDisabled, setBtnDisabled] = useState(true);
  const [btnContent, setBtnContent] = useState("List NFT");
  const router = useRouter();
  const { isConnected, signer } = useContext(WalletContext);

  async function onFileChange(e) {
    try {
      const file = e.target.files[0];
      if (!file) return;
      
      const data = new FormData();
      data.set("file", file);

      setBtnDisabled(true);
      updateMessage("Uploading image... Please don't click anything!");

      const response = await uploadFileToIPFS(data);
      if (response.success) {
        setBtnDisabled(false);
        updateMessage("");
        setFileURL(response.pinataURL);
      } else {
        updateMessage("Error uploading image.");
      }
    } catch (e) {
      console.error("Error during file upload:", e);
      updateMessage("Error during file upload.");
    }
  }

  async function uploadMetadataToIPFS() {
    const { name, description, price } = formParams;
    if (!name || !description || !price || !fileURL) {
      updateMessage("Please fill all the fields!");
      return null;
    }

    const nftJSON = {
      name,
      description,
      price,
      image: fileURL,
    };

    try {
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success) {
        return response.pinataURL;
      } else {
        updateMessage("Error uploading metadata.");
        return null;
      }
    } catch (e) {
      console.error("Error uploading JSON metadata:", e);
      updateMessage("Error uploading metadata.");
      return null;
    }
  }

  async function listNFT(e) {
    e.preventDefault(); // Prevent form submission

    try {
      setBtnContent("Processing...");
      const metadataURL = await uploadMetadataToIPFS();
      if (!metadataURL) return;

      updateMessage("Uploading NFT... Please don't click anything!");

      let contract = new ethers.Contract(
        marketplace.address,
        marketplace.abi,
        signer
      );
      const price = ethers.parseEther(formParams.price);

      let transaction = await contract.createToken(metadataURL, price);
      await transaction.wait();

      setBtnContent("List NFT");
      setBtnDisabled(true);
      updateMessage("");
      updateFormParams({ name: "", description: "", price: "" });
      alert("Successfully listed your NFT!");
      router.push("/");
    } catch (e) {
      alert("Upload error: " + e.message);
      console.error("Error listing NFT:", e);
    }
  }

  return (
    <div className={styles.container}>
      <Navbar/>
      {isConnected ? (
        <div className={styles.innerContainer}>
          <div className={styles.content}>
            <h2 className={styles.heading}>Upload your NFT</h2>
            <form className={styles.Form} onSubmit={listNFT}>
              <div className={styles.FormContent}>
                <label className={styles.Label}>NFT name</label>
                <input
                  type="text"
                  className={styles.Input}
                  value={formParams.name}
                  onChange={(e) =>
                    updateFormParams({ ...formParams, name: e.target.value })
                  }
                />
              </div>
              <div className={styles.FormContent}>
                <label className={styles.Label}>NFT description</label>
                <textarea
                  className={`${styles.Input} ${styles.TextArea}`}
                  value={formParams.description}
                  onChange={(e) =>
                    updateFormParams({
                      ...formParams,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className={styles.FormContent}>
                <label className={styles.Label}>Price (in Eth)</label>
                <input
                  type="number"
                  className={styles.Input}
                  value={formParams.price}
                  onChange={(e) =>
                    updateFormParams({ ...formParams, price: e.target.value })
                  }
                />
              </div>
              <div className={styles.FormContent}>
                <label className={styles.Label}>Upload image</label>
                <input
                  type="file"
                  className={styles.Input}
                  onChange={onFileChange}
                />
              </div>
              <br />
              <div className={styles.msg}>{message}</div>
              <button
                type="submit"
                className={
                  btnDisabled
                    ? `${styles.btn} ${styles.inactivebtn}`
                    : `${styles.btn} ${styles.activebtn}`
                }
                disabled={btnDisabled}
              >
                {btnContent === "Processing..." && (
                  <span className={styles.spinner} />
                )}
                {btnContent}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className={styles.innerContainer}>
          <div className={styles.notConnected}>
            Connect Your Wallet to Continue...
          </div>
        </div>
      )}
    </div>
  );
}
