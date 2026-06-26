<?php
// Konfigurasi
$targetDir = "uploads/";
$maxFileSize = 500 * 1024 * 1024; // 500MB
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'mp3', 'wav', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'apk', 'txt'];
$allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime',
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip', 'application/x-rar-compressed',
    'application/vnd.android.package-archive',
    'text/plain'
];

// Buat direktori upload jika belum ada
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

// Response function
function sendResponse($success, $message, $data = []) {
    header('Content-Type: application/json');
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $data));
    exit;
}

// Cek method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method tidak diizinkan');
}

// Cek apakah ada file
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    sendResponse(false, 'Tidak ada file yang diupload atau terjadi error');
}

$file = $_FILES['file'];

// Cek ukuran file
if ($file['size'] > $maxFileSize) {
    sendResponse(false, 'Ukuran file terlalu besar! Maksimal 500MB');
}

// Cek tipe file
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedMimeTypes)) {
    sendResponse(false, 'Tipe file tidak diizinkan');
}

// Generate nama file unik
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$newFileName = uniqid() . '.' . $extension;
$targetPath = $targetDir . $newFileName;

// Pindahkan file
if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Generate URL
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $baseUrl = $protocol . '://' . $host . dirname($_SERVER['PHP_SELF']);
    $fileUrl = $baseUrl . '/' . $targetPath;

    sendResponse(true, 'File berhasil diupload', [
        'file_name' => $file['name'],
        'file_size' => $file['size'],
        'file_url' => $fileUrl,
        'link' => $fileUrl
    ]);
} else {
    sendResponse(false, 'Gagal menyimpan file');
}
?>