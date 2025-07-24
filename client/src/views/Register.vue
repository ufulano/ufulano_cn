<template>
  <el-card class="register-card">
    <h2>注册</h2>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="70px" @keyup.enter="onSubmit">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" autocomplete="username" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" autocomplete="email" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" autocomplete="new-password" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSubmit">注册</el-button>
        <el-button link @click="goLogin">登录</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const form = ref({ username: '', email: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const onSubmit = () => {
  formRef.value.validate(async valid => {
    if (!valid) return
    loading.value = true
    try {
      const res = await register(form.value)
      localStorage.setItem('token', res.token)
      ElMessage.success('注册成功')
      router.push('/')
    } catch (e) {
      // 错误已由拦截器处理
    } finally {
      loading.value = false
    }
  })
}

const goLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-card {
  max-width: 400px;
  margin: 100px auto;
  padding: 32px 24px;
}
</style> 