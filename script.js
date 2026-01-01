let cropper;
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const imageWrapper = document.getElementById('imageWrapper');
const status = document.getElementById('status');
const resultDiv = document.getElementById('result');

// ১. ইনপুট ক্লিক করলে ভ্যালু রিসেট করা
imageInput.onclick = function() {
    this.value = null;
};

// ২. ছবি আপলোড চেঞ্জ ইভেন্ট
imageInput.onchange = function(e) {
    // সমস্যা এখানে ছিল: e.target.files দিয়ে প্রথম ফাইলটি নিতে হবে
    const selectedFile = e.target.files; 
    
    // যদি কোনো ছবি সিলেক্ট না করে ক্যানসেল দেওয়া হয়
    if (!selectedFile) {
        status.innerText = "কোনো ছবি সিলেক্ট করা হয়নি।";
        return;
    }

    // এটি নিশ্চিত করে যে ফাইলটি আসলেও একটি ছবি
    if (!selectedFile.type.startsWith('image/')) {
        alert("দয়া করে শুধুমাত্র ছবি (Image) ফাইল আপলোড করুন।");
        return;
    }

    status.innerText = "ছবি লোড হচ্ছে...";
    const reader = new FileReader();
    
    reader.onload = function(event) {
        imagePreview.src = event.target.result;
        imageWrapper.style.display = 'block';

        // ছবি পুরোপুরি লোড হওয়ার পর ক্রপার চালু করা
        imagePreview.onload = function() {
            if (cropper) cropper.destroy();
            
            try {
                cropper = new Cropper(imagePreview, {
                    viewMode: 2,
                    dragMode: 'move',
                    autoCropArea: 1,
                    checkOrientation: true 
                });
                status.innerText = "ছবি সফলভাবে লোড হয়েছে। এখন সাইজ বাটনে ক্লিক করুন।";
                status.style.color = "black";
            } catch (err) {
                status.innerText = "Error: ক্রপার চালু করা সম্ভব হয়নি। লাইব্রেরি ফাইল চেক করুন।";
                console.error(err);
            }
        };
    };
    
    // সংশোধিত লাইন: এখানে সরাসরি একক ফাইল অবজেক্ট পাঠানো হয়েছে
    reader.readAsDataURL(selectedFile); 
};

// ৩. রিসাইজিং লজিক
async function processImage(width, height, maxKb) {
    if (!cropper) {
        alert("দয়া করে আগে একটি ছবি আপলোড করুন!");
        return;
    }

    status.innerText = "প্রসেসিং হচ্ছে...";
    status.style.color = "blue";
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

    // ইটারেটিভ কমপ্রেশন: সাইজ লিমিটের নিচে না আসা পর্যন্ত কোয়ালিটি কমানো হবে [1]
    do {
        blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', quality));
        sizeKb = blob.size / 1024;
        quality -= 0.05;
    } while (sizeKb > maxKb && quality > 0.1);

    // ডাউনলোড লিঙ্ক তৈরি করা
    const url = URL.createObjectURL(blob);
    status.innerText = `রেডি! সাইজ: ${sizeKb.toFixed(2)} KB`;
    status.style.color = "green";
    resultDiv.innerHTML = `<a href="${url}" download="teletalk_${width}x${height}.jpg" class="download-link">ডাউনলোড করুন</a>`;
}

// বাটন ক্লিক ইভেন্ট [2, 3]
document.getElementById('photoBtn').onclick = () => {
    if(cropper) cropper.setAspectRatio(1/1); // ৩০০x৩০০
    processImage(300, 300, 100);
};

document.getElementById('signBtn').onclick = () => {
    if(cropper) cropper.setAspectRatio(300/80); // ৩০০x৮০
    processImage(300, 80, 60);
};
