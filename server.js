const preview = document.getElementById("preview");

let options = {
  sharp: false,
  color: false,
  blur: false
};

document.getElementById("upload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = "inline-block"; 
    preview.style.filter = "none"; 
  }
});

function toggle(opt) {
  options[opt] = !options[opt];
  document.getElementById(opt).classList.toggle("active");
}

// 💡 진짜 AI 복원만 테스트하는 엄격한 로직
async function restore() {
  const file = document.getElementById("upload").files[0];
  
  if (!file) {
    alert("이미지를 먼저 선택해주세요!");
    return;
  }

  // 가짜 효과 끄고 로딩 이미지 띄우기
  preview.style.filter = "none"; 
  preview.src = "https://i.gifer.com/ZKZg.gif"; 

  try {
    const formData = new FormData();
    formData.append("image", file);
    
    const res = await fetch("http://127.0.0.1:5000/restore", {
      method: "POST",
      body: formData
    });
    
    if (!res.ok) throw new Error(`서버 에러 (${res.status})`);
    
    const data = await res.json();
    
    if (data.error) throw new Error(data.error);

    preview.src = data.imageUrl; 
    alert("✨ 진짜 AI 복원 완료! (성공)");
    
  } catch (error) {
    // 🚨 에러가 나면 숨기지 않고 화면에 대문짝만하게 띄웁니다!
    alert("🚨 AI 연결 실패: " + error.message + "\n(파이썬 터미널의 에러 로그를 확인하세요)");
    preview.src = ""; // 실패하면 로딩 이미지 지우기
  }
}

function downloadImage() {
  // 다운로드 기능은 동일
  if (!preview.src) return;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = preview.src;
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const link = document.createElement("a");
    link.download = "restored-image.png";
    link.href = canvas.toDataURL();
    link.click();
  };
}