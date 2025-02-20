// src/api/news.js
import request from '@/utils/request'

// 获取新闻列表
export function getNewsList(params) {
  return request({
    url: '/news/list',
    method: 'get',
    params,
    paramsSerializer: params => {
      const searchParams = new URLSearchParams()
      Object.keys(params).forEach(key => {
        searchParams.append(key, params[key])
      })
      return searchParams.toString()
    }
  })
}

// 获取新闻详情
export function getNewsDetail(id) {
  return request({
    url: `/news/${id}`,
    method: 'get'
  })
}

// 创建新闻
export function createNews(data) {
  return request({
    url: '/news',
    method: 'post',
    data
  })
}

// 更新新闻
export function updateNews(id, data) {
  return request({
    url: `/news/${id}`,
    method: 'put',
    data
  })
}

// 删除新闻
export function deleteNews(id) {
  return request({
    url: `/news/${id}`,
    method: 'delete'
  })
}

// 发布新闻
export function publishNews(id) {
  return request({
    url: `/news/${id}/publish`,
    method: 'post'
  })
}

// 增加新闻浏览量
export function increaseViewCount(id) {
  return request({
    url: `/news/${id}/view`,
    method: 'post'
  })
}
