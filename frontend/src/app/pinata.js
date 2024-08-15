"use server"

import { headers } from 'next/headers';

const axios = require('axios');
const jwt = process.env.jwt;

export const uploadJsonToIPFS = async(JSONBody)=>{
    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
    try{
        const res = await axios.post(url, JSONBody,{
            headers:{
                Authorization: `Bearer ${jwt}`,
            }
        });
        return {
            success: true,
            pinataURL: "https://bronze-giant-damselfly-501.mypinata.cloud/ipfs/" + res.data.IpfsHash,
        }
    }
    catch(error){
        console.log(error);
        return{
            success: false,
            message: error.message
        }
    }
}

export const uploadFileToIPFS = async (data) => {
    const pinataMetadata = JSON.stringify({
        name: data.get('file').name,
    })
    data.append('pinataMetadata', pinataMetadata);
    const pinataOptions = JSON.stringify({
        cidVersion: 0,
    })
    data.append('pinataOptions', pinataOptions);
    try{
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
            maxBodyLength: "Infinity",
            headers: {
                "Content-type": `multipart/form-data; boundry=${data._boundry}`,
                Authorization: `Bearer ${jwt}`,
            },
        })
    return {
        success: true,
        pinataURL: "https://bronze-giant-damselfly-501.mypinata.cloud/ipfs/" + res.data.IpfsHash,
    }
    }
    catch(error){
        console.log(error);
        return{
            success: false,
            message: error.message
        }
    }
}