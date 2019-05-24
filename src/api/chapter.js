import request from '@/utils/request'

export function createChapter(data) {
  return request({
    url: '/chapter/add',
    method: 'post',
    data
  })
}

export function updateChapter(data) {
  return request({
    url: '/chapter/edit',
    method: 'post',
    data
  })
}

export function delChapter(id) {
  return request({
    url: '/chapter/del/' + id,
    method: 'get'
  })
}

export function selectChapter(data) {
  return request({
    url: '/chapter/findByPage',
    method: 'post',
    data
  })
}
