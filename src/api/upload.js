// src/api/upload.js
import request from '@/utils/request'

// 上传文件
export function uploadFile(data) {
  return request({
    url: '/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 上传头像
export function uploadAvatar(data) {
  return request({
    url: '/upload/avatar',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除文件
export function deleteFile(fileUrl) {
  return request({
    url: '/upload',
    method: 'delete',
    params: { url: fileUrl }
  })
}

export default {
  uploadFile,
  uploadAvatar,
  deleteFile
}
