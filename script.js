let cropper;
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const imageWrapper = document.getElementById('imageWrapper');
const status = document.getElementById('status');
const resultDiv = document.getElementById('result');
const dropZone = document.getElementById('dropZone');

// ক্লিক করলে ফাইল ইনপুট ওপেন হবে
dropZone.onclick = () => imageInput.click();

// একই ছবি বারবার সিলেক্ট করার জন্য রিসেট
imageInput.onclick = function() { this.value = null; };

imageInput.onchange = function(e) {
    const file = e.target.files;
    if (!file) return;

    status.innerText = "ছবি লোড হচ্ছে...";
    const reader = new FileReader();
    
    reader.onload = function(event) {
        imagePreview.src = event.target.result;
        imageWrapper.style.display = 'block';

        imagePreview.onload = function() {
            if (cropper) cropper.destroy();
            
            cropper = new Cropper(imagePreview, {
                viewMode: 2,
                dragMode: 'move',
                autoCropArea: 1,
                checkOrientation: true // মোবাইল রোটেশন ঠিক করার জন্য 
            });
            status.innerText = "ছবি লোড হয়েছে। এখন ক্রপ করুন।";
        };
    };
    reader.readAsDataURL(file);
};

async function processImage(width, height, maxKb) {
    if (!cropper) return alert("দয়া করে আগে একটি ছবি আপলোড করুন!");

    status.innerText = "প্রসেসিং হচ্ছে...";
    resultDiv.innerHTML = "";

    // ক্যানভাসে নির্দিষ্ট ডাইমেনশনে ছবি নেওয়া 
    const canvas = cropper.getCroppedCanvas({
        width: width,
        height: height,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    });

    let quality = 0.92;
    let blob;
    let sizeKb = 0;

    // ইটারেটিভ কমপ্রেশন লজিক যাতে সাইজ লিমিটের নিচে থাকে [1]
    do {
        blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', quality));
        sizeKb = blob.size / 1024;
        quality -= 0.05;
    } while (sizeKb > maxKb && quality > 0.1);

    const url = URL.createObjectURL(blob);
    status.innerText = `রেডি! সাইজ: ${sizeKb.toFixed(2)} KB`;
    resultDiv.innerHTML = `<a href="${url}" download="teletalk_${width}x${height}.jpg" class="download-link">ডাউনলোড করুন</a>`;
}

document.getElementById('photoBtn').onclick = () => {
    if(cropper) cropper.setAspectRatio(1/1);
    processImage(300, 300, 100);
};

document.getElementById('signBtn').onclick = () => {
    if(cropper) cropper.setAspectRatio(300/80);
    processImage(300, 80, 60);
};
