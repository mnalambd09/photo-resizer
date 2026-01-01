let cropper;
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');

// ছবি আপলোড হলে প্রিভিউ দেখানো
imageInput.addEventListener('change', (e) => {
    const file = e.target.files;
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.src = event.target.result;
            imagePreview.style.display = 'block';
            if (cropper) cropper.destroy();
            cropper = new Cropper(imagePreview, {
                viewMode: 1,
                dragMode: 'move'
            });
        };
        reader.readAsDataURL(file);
    }
});

// রিসাইজ এবং কমপ্রেশন ফাংশন 
async function processImage(width, height, maxKb) {
    if (!cropper) return alert("Please select an image first!");
    
    // ক্রপ করা অংশ ক্যানভাসে নেয়া
    const canvas = cropper.getCroppedCanvas({ width, height });
    
    // বাইনারি সার্চের মাধ্যমে কোয়ালিটি অ্যাডজাস্ট করা যাতে ফাইল সাইজ লিমিটের মধ্যে থাকে [3]
    let quality = 0.9;
    let blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', quality));
    
    while (blob.size / 1024 > maxKb && quality > 0.1) {
        quality -= 0.05;
        blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', quality));
    }

    // ডাউনলোড লিংক তৈরি [6]
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resized_image.jpg`;
    link.innerText = `Download (${(blob.size/1024).toFixed(2)} KB)`;
    document.getElementById('result').innerHTML = '';
    document.getElementById('result').appendChild(link);
}

// বাটন ক্লিক ইভেন্ট
document.getElementById('resizePhotoBtn').onclick = () => processImage(300, 300, 100);
document.getElementById('resizeSignBtn').onclick = () => processImage(300, 80, 60);
