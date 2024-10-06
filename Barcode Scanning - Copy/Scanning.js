const video = document.getElementById('camera');
const barcodeResult = document.getElementById('barcode-result');
const productImage = document.getElementById('product-image');
const stopButton = document.getElementById('stop-button')
let stream;

// Thông tin API
const apiKey = 'API key'; // Thay bằng API key của bạn
const cx = 'Engine ID'; // Thay bằng Custom Search Engine ID của bạn

// Lấy hình ảnh từ camera và hiển thị trong video
navigator.mediaDevices.getUserMedia({ video: true })
    .then(function(stream) {
        video.srcObject = stream; // Gắn luồng video vào phần tử video

        // Chạy QuaggaJS để quét mã vạch
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: video, // Dùng video từ camera
                constraints: {
                    facingMode: "environment" // Sử dụng camera sau
                }
            },
            decoder: {
                readers: ["code_128_reader", "ean_reader", "upc_reader", "code_39_reader"], // Các loại mã vạch cần quét
            }
        }, function(err) {
            if (err) {
                console.error(err);
                return;
            }
            Quagga.start();
        });

        // Sự kiện khi phát hiện mã vạch
        Quagga.onDetected(function(result) {
            const code = result.codeResult.code;
            console.log(code);
            barcodeResult.innerText = `Mã vạch phát hiện: ${code}`;
            console.log("Mã vạch đã quét: ", code);

            // Gọi API để tìm kiếm hình ảnh từ mã vạch
            fetchImageFromGoogle(code);
        });

    })
    .catch(function(error) {
        console.error("Lỗi khi truy cập camera: ", error);
    });

// Hàm để lấy hình ảnh từ Google Custom Search API
async function fetchImageFromGoogle(query) {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&searchType=image&q=${encodeURIComponent(query)}&num=1`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const imageUrl = data.items[0].link; // Lấy URL ảnh đầu tiên
            productImage.src = imageUrl; // Hiển thị ảnh trên trang
        } else {
            productImage.src = ''; // Xóa ảnh nếu không có kết quả
            alert('Không tìm thấy hình ảnh cho mã vạch này.');
        }
    } catch (error) {
        console.error('Lỗi khi tìm kiếm hình ảnh:', error);
    }
}
stopButton.addEventListener('click', stopScanning);
