import request from '@/utils/request'

export function createDetail(data) {
  return request({
    url: '/detail/add',
    method: 'post',
    data
  })
}

export function updateDetail(data) {
  return request({
    url: '/detail/edit',
    method: 'post',
    data
  })
}

export function delDetail(id) {
  return request({
    url: '/detail/del/' + id,
    method: 'get'
  })
}

export function selectDetail(data) {
  return request({
    url: '/detail/findByPage',
    method: 'post',
    data
  })
}
