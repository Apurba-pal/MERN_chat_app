import Message from "../models/message.model.js";
import userModel from "../models/user.model.js";

export const getUserForSidebar = async (req, res) =>{
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await userModel.find({ _id: { $ne: loggedInUserId }}).select("-password")
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUserForSidebar", error.message);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}


export const getMessages = async (req, res) => {
    try {
        const {id:userToChatId} = req.params
        const myId = req.user._id
        const message = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })
        res.status(200).json(message);
    } catch (error) {
        console.error("error in the getMessage controller", error.message)
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

export const sendMessage = async (req, res)=>{
    try {
        const {text, image} = req.body
        const myId = req.user._id
        const { id:userToChatId } = req.params
        let imageUrl;
        if (image){
                const uploadResponse = await cloudinary.uploader.upload(profilePic);
                imageUrl = uploadResponse.secure_url;
        }
        const newMessage = new Message({
            senderId: myId,
            receiverId: userToChatId,
            text,
            image: imageUrl
        })
        await newMessage.save()
        res.status(201).json(newMessage);

        // todo realtime functionality here: socket.io
    } catch (error) {
        console.error("error in sned message",error.message);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}