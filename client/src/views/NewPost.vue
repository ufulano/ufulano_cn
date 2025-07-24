<template>
  <el-card class="new-post-card">
    <h2>发帖</h2>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="内容" prop="content">
        <el-input v-model="form.content" type="textarea" :rows="4" maxlength="500" show-word-limit />
      </el-form-item>
      <el-form-item label="图片">
        <el-upload
          action=""
          list-type="picture-card"
          :auto-upload="false"
          :on-change="onImageChange"
          :file-list="fileList"
          :limit="4"
          :on-remove="onImageRemove"
        >
          <el-icon><i class="el-icon-plus" /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="话题">
        <el-input v-model="form.topics" placeholder="多个话题用逗号分隔" />
      </el-form-item>
      <el-form-item label="可见性">
        <el-select v-model="form.visibility" placeholder="请选择">
          <el-option label="公开" value="public" />
          <el-option label="仅粉丝" value="follower" />
          <el-option label="仅自己" value="private" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSubmit">发布</el-button>
        <el-button @click="goBack">返回</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createPost } from '../api/post'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)
const form = ref({
  content: '',
  images: [],
  topics: '',
  visibility: 'public'
})
const fileList = ref([])
const rules = {
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const onImageChange = (file, fileListArr) => {
  const reader = new FileReader()
  reader.onload = e => {
    form.value.images.push(e.target.result)
  }
  reader.readAsDataURL(file.raw)
  fileList.value = fileListArr
}
const onImageRemove = (file, fileListArr) => {
  form.value.images.splice(fileListArr.length, 1)
  fileList.value = fileListArr
}
const onSubmit = () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录后发帖')
    router.push('/login')
    return
  }
  formRef.value.validate(async valid => {
    if (!valid) return
    loading.value = true
    try {
      const payload = {
        content: form.value.content,
        images: form.value.images,
        topics: form.value.topics.split(',').map(t => t.trim()).filter(Boolean),
        visibility: form.value.visibility
      }
      await createPost(payload)
      ElMessage.success('发布成功')
      router.push('/')
      setTimeout(() => window.location.reload(), 300)
    } catch (e) {
      // 错误已由拦截器处理
    } finally {
      loading.value = false
    }
  })
}
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.new-post-card {
  max-width: 600px;
  margin: 60px auto;
  padding: 32px 24px;
}
</style> 