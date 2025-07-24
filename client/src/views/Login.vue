<template>
  <el-card class="login-card">
    <el-alert title="测试账号：testuser  密码：test123" type="info" show-icon style="margin-bottom: 18px;" />
    <h2>登录</h2>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="70px" @keyup.enter="onSubmit">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" autocomplete="username" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" autocomplete="current-password" />
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="form.remember">记住我</el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSubmit">登录</el-button>
        <el-button link @click="goRegister">注册</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api/auth'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)
const form = ref({ username: '', password: '', remember: false })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const onSubmit = () => {
  formRef.value.validate(async valid => {
    if (!valid) return
    loading.value = true
    try {
      const res = await login(form.value)
      userStore.setUser(res.token, res.user)
      ElMessage.success('登录成功')
      router.push('/')
    } catch (e) {
      // 错误已由拦截器处理
    } finally {
      loading.value = false
    }
  })
}

const goRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-card {
  max-width: 400px;
  margin: 100px auto;
  padding: 32px 24px;
}
</style> 