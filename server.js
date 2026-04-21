const preview = document.getElementById("preview");

let options = {
  sharp: false,
  color: false,
  blur: false
};

// 1. 파일 업로드 기능
document.getElementById("upload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = "inline-block"; // 화면에 보이게 설정
    preview.style.filter = ""; // 필터 초기화
  }
});

// 2. 버튼 토글 기능
function toggle(opt) {
  options[opt] = !options[opt];
  document.getElementById(opt).classList.toggle("active");
}

// 3. 필터(효과) 적용 기능
function applyEffect() {
  let filter = "";
  if (options.sharp) filter += "contrast(160%) brightness(110%) ";
  if (options.color) filter += "saturate(200%) ";
  if (options.blur) filter += "blur(2px) ";

  preview.style.filter = filter;
}

// 4. 복원하기 연결 (파이썬 서버와 통신)
async function restore() {
  const file = document.getElementById("upload").files[0];
  
  if (!file) {
    alert("이미지를 먼저 선택해주세요!");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("image", file);
    
    // 파이썬 서버(5000포트)로 전송
    const res = await fetch("http://localhost:5000/restore", {
      method: "POST",
      body: formData
    });
    
    if (!res.ok) throw new Error("서버 응답 오류");
    
    const data = await res.json();
    preview.src = data.imageUrl; // AI가 준 이미지로 교체
    alert("✨ AI 복원 완료!");
    
  } catch (error) {
    console.log("서버가 연결되지 않아 기본 필터 효과만 적용합니다.");
    applyEffect();
    alert("화면 효과 적용 완료! (AI 서버가 꺼져있습니다)");
  }
}

// 5. 다운로드 기능
function downloadImage() {
  if (!preview.src) {
    alert("다운로드할 이미지가 없습니다.");
    return;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = preview.src;

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;

    let filter = "";
    if (options.sharp) filter += "contrast(160%) brightness(110%) ";
    if (options.color) filter += "saturate(200%) ";
    if (options.blur) filter += "blur(2px) ";

    ctx.filter = filter;
    ctx.drawImage(img, 0, 0);

    const link = document.createElement("a");
    link.download = "restored-image.png";
    link.href = canvas.toDataURL();
    link.click();
  };
}