<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="单词" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item v-for="word in scope.row.wordCh" :key="word.key" :label="word.pos">
              <span>{{ word.meaning }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column align="center" label="序号" width="55">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="单词" align="center">
        <template slot-scope="scope">
          {{ scope.row.wordEn }}
        </template>
      </el-table-column>
      <el-table-column label="音标" width="200" align="center">
        <template slot-scope="scope">
          {{ scope.row.wordPhoneticSymbol }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.ewStatus | statusFilter">{{ scope.row.ewStatus == 1 ? "可用" : "删除" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="create_at" label="创建时间" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="update_at" label="修改时间" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.updateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="row.ewStatus!=0" size="mini" type="primary" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.ewStatus!=0" size="mini" type="danger" @click="handleDelete(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 480px; margin-left:50px;">
        <el-form-item label="单词" prop="wordEn">
          <el-input v-model="temp.wordEn" />
        </el-form-item>
        <el-form-item label="音标" prop="wordPhoneticSymbol">
          <el-input v-model="temp.wordPhoneticSymbol" />
        </el-form-item>
        <el-form-item
          v-for="(domain, index) in temp.wordCh"
          :key="domain.key"
          :label="'释义' + index"
          :prop="'wordCh.' + index + '.pos'"
          :rules="{
            required: true, message: '词性不能为空', trigger: 'blur'
          }"
        >
          <el-input v-model="domain.pos" style="width: 120px" placeholder="请填写词性" />
          <el-input v-model="domain.meaning" style="width: 182px" placeholder="请填写释义" />
          <el-button @click.prevent="removeDomain(domain)">删除</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="addDomain">新增释义</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { createDetail, updateDetail, delDetail, selectDetail } from '@/api/detail'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves' // waves directive

export default {
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      listLoading: true,
      total: 100,
      chapterId: undefined,
      listQuery: {
        page: 1,
        limit: 5,
        title: '',
        sort: '+id'
      },
      params: {
        pageNum: 1,
        pageSize: 5,
        wordEn: '',
        chapterId: undefined
      },
      temp: {
        id: undefined,
        chapterId: undefined,
        wordEn: '',
        wordPhoneticSymbol: '',
        wordCh: [{
          pos: '',
          meaning: '',
          key: Date.now()
        }]
      },
      postData: undefined,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      },
      rules: {
        wordEn: [{ required: true, message: '请填写英文单词', trigger: 'blur' }],
        wordPhoneticSymbol: [{ required: true, message: '请填写英文音标', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.chapterId = this.$route.params.id
    this.fetchData()
  },
  methods: {
    removeDomain(item) {
      var index = this.temp.wordCh.indexOf(item)
      if (index !== 0) {
        this.temp.wordCh.splice(index, 1)
      } else {
        this.$message({
          type: 'info',
          message: '至少要有一个释义'
        })
      }
    },
    addDomain() {
      this.temp.wordCh.push({
        pos: '',
        meaning: '',
        key: Date.now()
      })
    },
    fetchData() {
      this.listLoading = true
      this.params.pageNum = this.listQuery.page
      this.params.pageSize = this.listQuery.limit
      this.params.wordEn = this.listQuery.title
      this.params.chapterId = this.chapterId
      selectDetail(this.params).then(response => {
        this.list = response.data.list
        for (const i in this.list) {
          if (this.list[i].wordCh !== null && this.list[i].wordCh !== undefined) {
            this.list[i].wordCh = JSON.parse(this.list[i].wordCh)
          } else {
            this.list[i].wordCh = []
          }
        }
        this.total = response.data.total
        this.listLoading = false
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        chapterId: this.chapterId,
        wordEn: '',
        wordPhoneticSymbol: '',
        wordCh: [{
          pos: '',
          meaning: '',
          key: Date.now()
        }]
      }
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.preHandle(this.temp)
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createDetail(this.postData).then(response => {
            this.resetTemp()
            this.fetchData()
            this.dialogFormVisible = false
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.id = row.id
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    preHandle(temp) {
      this.postData = Object.assign({}, temp)
      this.postData.wordCh = JSON.stringify(temp.wordCh)
    },
    updateData() {
      this.preHandle(this.temp)
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateDetail(this.postData).then(response => {
            this.resetTemp()
            this.fetchData()
            this.dialogFormVisible = false
          })
        }
      })
    },
    handleDelete(id) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delDetail(id).then(response => {
          this.fetchData()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>
