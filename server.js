import express from "express";
import multer from "multer";

const app = express();
const upload = multer();

app.post("/restore", upload.single("image"), async (req, res) => {
  try {
    console.log("요청 들어옴");

    if (!req.file) {
      return res.status(400).json({ error: "파일 없음" });
    }

    const base64 = req.file.buffer.toString("base64");
    const imageUrl = `data:${req.file.mimetype};base64,${base64}`;

    console.log("이미지 변환 완료");

    res.json({
      message: "복원 완료!",
      imageUrl: imageUrl
    });

  } catch (err) {
    console.error("에러:", err);
    res.status(500).json({ error: "서버 에러" });
  }
});

app.listen(3000, () => {
  console.log("서버 실행: http://localhost:3000");
});