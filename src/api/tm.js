import request from '@/utils/request'

export function createTm(data) {
  return request({
    url: '/teachMaterial/add',
    method: 'post',
    data
  })
}

export function updateTm(data) {
  return request({
    url: '/teachMaterial/edit',
    method: 'post',
    data
  })
}

export function delTm(id) {
  return request({
    url: '/teachMaterial/del/' + id,
    method: 'get'
  })
}

export function selectTm(data) {
  return request({
    url: '/teachMaterial/findByPage',
    method: 'post',
    data
  })
}
