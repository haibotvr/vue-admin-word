<template>
  <div class="app-container">
    <el-row :gutter="18">
      <!-- <el-col :span="24" v-show="false">
        <div class="grid-content bg-purple">
          <div class="number"><span>{{ nowPosition + 1 }}</span>/{{ totalNum }}</div>
          <div class="picture"><img src="../../../assets/study/orange.png" /></div>
          <div class="sound">
            <label>{{ phoneticSymbol }}</label>
            <svg-icon icon-class="sound" />
          </div>
          <dl class="select-box">
            <dd>
              <el-radio v-model="radio1" label="1" border>备选项1</el-radio>
            </dd>
            <dd>
              <el-radio v-model="radio1" label="2" border>备选项2</el-radio>
            </dd>
            <dd>
              <el-radio v-model="radio1" label="3" border>备选项1</el-radio>
            </dd>
            <dd>
              <el-radio v-model="radio1" label="4" border>备选项1</el-radio>
            </dd>
          </dl>
          <div class="btn-box">
            <el-button type="primary" round>确定</el-button>
          </div>
        </div>
      </el-col> -->
      <el-col v-show="dialogWrite" :span="24">
        <div class="grid-content bg-purple">

          <div class="number"><span>{{ nowPosition + 1 }}</span>/{{ totalNum }}</div>
          <!-- <div class="picture"><img src="../../../assets/study/orange.png" /></div> -->
          <div class="sound">
            <label>{{ phoneticSymbol }}</label>
            <svg-icon icon-class="sound" />
          </div>
          <div class="write-answer">
            <el-input v-model="writeAnswer" placeholder="请在此处填写单词答案" suffix-icon="el-icon-edit" prop="writeAnswer" clearable />
          </div>
          <div class="btn-box">
            <el-button type="primary" round @click="tip()">提示</el-button>
            <el-button type="primary" round @click="checkWord(writeAnswer)">确定</el-button>
          </div>
        </div>
      </el-col>
      <el-col v-show="dialogTip" :span="24">
        <div class="grid-content bg-purple">
          <div class="sound">
            <label>{{ phoneticSymbol }}</label>
            <svg-icon icon-class="sound" />
          </div>
          <dl class="select-box">
            <dd v-for="obj in wordCh" :key="obj.key">
              <h2>{{ obj.pos }}</h2><h2>{{ obj.meaning }}</h2>
            </dd>
          </dl>
        </div>
      </el-col>
      <el-col v-show="dialogRight" :span="24">
        <div class="grid-content bg-purple">
          <div class="number"><span>{{ nowPosition + 1 }}</span>/{{ totalNum }}</div>
          <div class="picture">
            <img src="../../../assets/study/resultA.png">
            <h1 class="resultA">回答正确</h1>
          </div>
          <div class="answer">
            <h1>{{ answer }}</h1>
            <label>{{ phoneticSymbol }}</label>
            <i class="el-icon-video-play" />
          </div>
          <div class="btn-box">
            <el-button type="primary" round @click="nextWord()">{{ nextWordText }}</el-button>
          </div>
        </div>
      </el-col>
      <el-col v-show="dialogWrong" :span="24">
        <div class="grid-content bg-purple">
          <div class="number"><span>{{ nowPosition + 1 }}</span>/{{ totalNum }}</div>
          <div class="picture">
            <img src="../../../assets/study/resultB.png">
            <h1 class="resultB">回答错误</h1>
          </div>
          <div class="answer">
            <h1>{{ answer }}</h1>
            <label>{{ phoneticSymbol }}</label>
            <i class="el-icon-video-play" />
          </div>
          <div class="btn-box">
            <el-button type="primary" round @click="nextWord()">{{ nextWordText }}</el-button>
          </div>
        </div>
      </el-col>
      <el-col v-show="dialogResult" :span="24">
        <div class="grid-content bg-purple">
          <h1>回答正确{{ rightNum }}个</h1>
          <h1>回答错误{{ totalNum - rightNum }}个</h1>
          <h1>正确率{{ correctness }}%</h1>
          <div class="btn-box">
            <el-button type="primary" round @click="nextStudy()">继续学习</el-button>
          </div>
        </div>
      </el-col>
      <el-col v-show="dialogFinish" :span="24">
        <div class="grid-content bg-purple">
          <h1>本书已学完</h1>
          <div class="btn-box">
            <el-button type="primary" round @click="reStudy()">重新学习</el-button>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { selectWords, addStudyLog, reStudy } from '@/api/study'

export default {
  data() {
    return {
      tmId: undefined,
      chapterId: undefined,
      correctness: '',
      rightNum: 0,
      wrongNum: 0,
      nextWordText: '下一个单词',
      dialogTip: false,
      dialogWrite: false,
      dialogRight: false,
      dialogWrong: false,
      dialogResult: false,
      dialogFinish: false,
      nowPosition: 0,
      totalNum: 1,
      answer: 'book',
      writeAnswer: '',
      phoneticSymbol: '[bʊk]',
      wordCh: [
        {
          pos: 'n',
          meaning: '书籍',
          key: 1558403714493
        },
        {
          pos: 'vt',
          meaning: '预定',
          key: 1558403714493
        }
      ],
      items: undefined
    }
  },
  created() {
    this.tmId = this.$route.params.id
    this.fetchData()
  },
  methods: {
    fetchData() {
      selectWords(this.tmId).then(response => {
        this.items = response.data
        if (!this.items) {
          this.dialogTip = false
          this.dialogWrite = false
          this.dialogRight = false
          this.dialogWrong = false
          this.dialogRight = false
          this.dialogResult = false
          this.dialogFinish = true
          return
        }
        this.totalNum = this.items.length
        this.chapterId = this.items[0].chapterId
        this.nextChapter()
        this.initPage(this.items, 0)
      })
    },
    tip() {
      if (this.dialogTip) {
        this.dialogTip = false
      } else {
        this.dialogTip = true
      }
    },
    checkWord(param) {
      if (!param) {
        this.$message({
          message: '请填写单词',
          type: 'warning'
        })
        return
      }
      if (this.answer === this.writeAnswer) {
        this.dialogTip = false
        this.dialogWrite = false
        this.dialogRight = true
        this.dialogWrong = false
        this.rightNum += 1
      } else {
        this.dialogTip = false
        this.dialogWrite = false
        this.dialogRight = false
        this.dialogWrong = true
        this.wrongNum += 1
      }
      if ((this.nowPosition + 1) === this.totalNum) {
        this.nextWordText = '查看学习结果'
      }
    },
    nextWord() {
      if ((this.nowPosition + 1) === this.totalNum) {
        this.showResult()
      } else {
        this.nextPage()
      }
    },
    showResult() {
      this.correctness = (this.rightNum * 100 / this.totalNum).toFixed(2)
      this.dialogResult = true
      this.dialogRight = false
      this.dialogWrong = false
      this.postResult()
    },
    postResult() {
      const temp = {
        tmId: this.tmId,
        chapterId: this.chapterId,
        correctness: this.correctness,
        totalNum: this.totalNum,
        rightNum: this.rightNum
      }
      addStudyLog(temp).then(response => {
        console.log(response.data)
      })
    },
    nextPage() {
      this.nowPosition += 1
      this.initPage(this.items, this.nowPosition)
    },
    nextChapter() {
      this.rightNum = 0
      this.wrongNum = 0
      this.correctness = ''
      this.writeAnswer = ''
    },
    nextStudy() {
      this.fetchData()
    },
    reStudy() {
      reStudy(this.tmId).then(response => {
        this.fetchData()
      })
    },
    initPage(item, pos) {
      this.nowPosition = pos
      this.phoneticSymbol = item[pos].wordPhoneticSymbol
      this.answer = item[pos].wordEn
      this.wordCh = JSON.parse(item[pos].wordCh)
      this.dialogWrite = true
      this.dialogTip = false
      this.dialogRight = false
      this.dialogWrong = false
      this.dialogResult = false
      this.dialogFinish = false
      this.writeAnswer = ''
    }
  }
}
</script>

<style scoped>
body{
  background-color: #f2f2f2;
}
dl{
  margin: 0;
}
/* 背单词 */
.bg-purple {
background: #ffffff;
box-shadow: 0 5px 17px rgba(0,0,0,.1);
}
.grid-content {
border-radius: 6px;
min-height: 36px;
padding: 12px 20px 30px;
}
.grid-content .number{
  font-size: 14px;
  margin-bottom: 12px;
}
.grid-content .number span{
   font-size: 36px;
   color: #409EFF;
}
.grid-content .picture{
  text-align: center;
  margin-bottom: 12px;
}
.grid-content .picture img{
  width: 220px;
  height: 220px;
}
.grid-content .sound{
  text-align: center;
  font-size: 18px;
  margin-bottom: 12px;
}
.grid-content .sound .svg-icon{
   color: #409EFF;
   font-size: 20px;
   margin-left: 4px;
   cursor: pointer;
}
.grid-content .select-box  dd{
  margin: 0 20px 20px 20px;
  }
.grid-content .select-box  dd .el-radio.is-bordered{
  width: 100%;
  border-radius: 40px;
}
.grid-content .btn-box{
  text-align: center;
}
.grid-content .write-answer{
  height: 220px;
  line-height: 220px;
  margin: 0px 20px 20px 20px;
}
.grid-content .picture h1{
  text-align: center;
  margin: 0;
}
.grid-content .picture h1.resultA{
  color: #67c23a;
}
.grid-content .picture h1.resultB{
  color: #f56c6c;
}
.grid-content .answer{
  height: 205px;
  margin: 0px 20px 20px 20px;
  text-align: center;
}
.grid-content .answer h1{
  padding: 60px 0 0 0;
}
</style>
