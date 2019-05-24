import request from '@/utils/request'

export function createSchool(data) {
  return request({
    url: '/school/add',
    method: 'post',
    data
  })
}

export function updateSchool(data) {
  return request({
    url: '/school/edit',
    method: 'post',
    data
  })
}

export function delSchool(id) {
  return request({
    url: '/school/del/' + id,
    method: 'get'
  })
}

export function selectSchool(data) {
  return request({
    url: '/school/findByPage',
    method: 'post',
    data
  })
}
