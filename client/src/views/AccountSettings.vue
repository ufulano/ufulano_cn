<template>
  <div class="account-settings-root">
    <AppHeader />
    
    <div class="settings-container">
      <!-- 左侧导航栏 -->
      <UserSidebar />
      
      <!-- 主内容区域 -->
      <main class="settings-main">
        <div class="settings-header">
          <h1>账号设置</h1>
          <p>管理你的账号信息和隐私设置</p>
        </div>
        
        <div class="settings-content">
          <!-- 基本信息设置 -->
          <el-card class="settings-card">
            <template #header>
              <div class="card-header">
                <h3>基本信息</h3>
                <el-button type="primary" @click="saveBasicInfo" :loading="saving">
                  保存更改
                </el-button>
              </div>
            </template>
            
            <el-form :model="basicForm" :rules="basicRules" ref="basicFormRef" label-width="100px">
              <!-- 头像设置 -->
              <el-form-item label="头像" prop="avatar">
                <div class="avatar-section">
                  <div class="current-avatar">
                    <el-avatar :size="80" :src="basicForm.avatar || userStore.user?.avatar_url" />
                    <div class="avatar-overlay" @click="showAvatarUpload = true">
                      <el-icon><Camera /></el-icon>
                      <span>更换头像</span>
                    </div>
                  </div>
                  
                  <div class="avatar-info">
                    <p>支持 JPG、PNG 格式，文件大小不超过 2MB</p>
                    <p>建议尺寸：200x200 像素</p>
                  </div>
                </div>
              </el-form-item>
              
              <!-- 用户名 -->
              <el-form-item label="用户名" prop="username">
                <el-input 
                  v-model="basicForm.username" 
                  placeholder="请输入用户名"
                  maxlength="20"
                  show-word-limit
                />
              </el-form-item>
              
              <!-- 昵称 -->
              <el-form-item label="昵称" prop="nickname">
                <el-input 
                  v-model="basicForm.nickname" 
                  placeholder="请输入昵称"
                  maxlength="30"
                  show-word-limit
                />
              </el-form-item>
              
              <!-- 邮箱 -->
              <el-form-item label="邮箱" prop="email">
                <el-input 
                  v-model="basicForm.email" 
                  placeholder="请输入邮箱"
                  type="email"
                />
              </el-form-item>
              
              <!-- 个人简介 -->
              <el-form-item label="个人简介" prop="bio">
                <el-input 
                  v-model="basicForm.bio" 
                  type="textarea" 
                  :rows="3"
                  placeholder="介绍一下自己吧..."
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
            </el-form>
          </el-card>
          
          <!-- 密码设置 -->
          <el-card class="settings-card">
            <template #header>
              <div class="card-header">
                <h3>密码设置</h3>
                <el-button type="primary" @click="savePassword" :loading="changingPassword">
                  修改密码
                </el-button>
              </div>
            </template>
            
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
              <el-form-item label="当前密码" prop="currentPassword">
                <el-input 
                  v-model="passwordForm.currentPassword" 
                  type="password" 
                  placeholder="请输入当前密码"
                  show-password
                />
              </el-form-item>
              
              <el-form-item label="新密码" prop="newPassword">
                <el-input 
                  v-model="passwordForm.newPassword" 
                  type="password" 
                  placeholder="请输入新密码"
                  show-password
                />
              </el-form-item>
              
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input 
                  v-model="passwordForm.confirmPassword" 
                  type="password" 
                  placeholder="请再次输入新密码"
                  show-password
                />
              </el-form-item>
            </el-form>
          </el-card>
          
          <!-- 隐私设置 -->
          <el-card class="settings-card">
            <template #header>
              <div class="card-header">
                <h3>隐私设置</h3>
                <el-button type="primary" @click="savePrivacySettings" :loading="savingPrivacy">
                  保存设置
                </el-button>
              </div>
            </template>
            
            <el-form :model="privacyForm" label-width="120px">
              <el-form-item label="个人资料可见性">
                <el-radio-group v-model="privacyForm.profileVisibility">
                  <el-radio label="public">公开</el-radio>
                  <el-radio label="followers">仅关注者</el-radio>
                  <el-radio label="private">私密</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="动态可见性">
                <el-radio-group v-model="privacyForm.postVisibility">
                  <el-radio label="public">公开</el-radio>
                  <el-radio label="followers">仅关注者</el-radio>
                  <el-radio label="private">私密</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="允许关注">
                <el-switch v-model="privacyForm.allowFollow" />
              </el-form-item>
              
              <el-form-item label="允许私信">
                <el-switch v-model="privacyForm.allowMessage" />
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </main>
    </div>
    
    <!-- 头像上传对话框 -->
    <el-dialog 
      v-model="showAvatarUpload" 
      title="更换头像" 
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="avatar-upload-content">
        <div v-if="!avatarFile" class="upload-section">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarChange"
            accept="image/*"
            class="avatar-uploader"
          >
            <div class="upload-placeholder">
              <el-icon><Plus /></el-icon>
              <span>点击上传图片</span>
              <p>支持 JPG、PNG 格式，文件大小不超过 2MB</p>
            </div>
          </el-upload>
        </div>
        
        <div v-else class="crop-section">
          <AvatarCropper 
            :image-src="avatarPreview" 
            :crop-size="200"
            ref="cropperRef"
          />
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelAvatarUpload">取消</el-button>
          <el-button type="primary" @click="confirmAvatarUpload" :loading="uploadingAvatar">
            确认上传
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Camera, 
  Plus 
} from '@element-plus/icons-vue'
import AppHeader from '../components/AppHeader.vue'
import UserSidebar from '../components/UserSidebar.vue'
import AvatarCropper from '../components/AvatarCropper.vue'
import { useUserStore } from '../store/user'

const userStore = useUserStore()

// 响应式数据
const saving = ref(false)
const changingPassword = ref(false)
const savingPrivacy = ref(false)
const uploadingAvatar = ref(false)
const showAvatarUpload = ref(false)
const avatarFile = ref(null)
const avatarPreview = ref('')
const cropperRef = ref(null)

// 表单引用
const basicFormRef = ref()
const passwordFormRef = ref()
const uploadRef = ref()
const cropImageRef = ref()
const cropOverlayRef = ref()

// 基本信息表单
const basicForm = reactive({
  username: userStore.user?.username || '',
  nickname: userStore.user?.nickname || '',
  email: userStore.user?.email || '',
  bio: userStore.user?.bio || '',
  avatar: userStore.user?.avatar_url || ''
})

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 隐私设置表单
const privacyForm = reactive({
  profileVisibility: 'public',
  postVisibility: 'public',
  allowFollow: true,
  allowMessage: true
})

// 表单验证规则
const basicRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { max: 30, message: '昵称长度不能超过 30 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 保存基本信息
const saveBasicInfo = async () => {
  try {
    await basicFormRef.value.validate()
    saving.value = true
    
    // TODO: 调用API保存基本信息
    console.log('保存基本信息:', basicForm)
    
    ElMessage.success('基本信息保存成功')
  } catch (error) {
    console.error('保存基本信息失败:', error)
    ElMessage.error('保存失败，请检查输入')
  } finally {
    saving.value = false
  }
}

// 保存密码
const savePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    changingPassword.value = true
    
    // TODO: 调用API修改密码
    console.log('修改密码:', passwordForm)
    
    ElMessage.success('密码修改成功')
    
    // 清空密码表单
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('修改失败，请检查输入')
  } finally {
    changingPassword.value = false
  }
}

// 保存隐私设置
const savePrivacySettings = async () => {
  try {
    savingPrivacy.value = true
    
    // TODO: 调用API保存隐私设置
    console.log('保存隐私设置:', privacyForm)
    
    ElMessage.success('隐私设置保存成功')
  } catch (error) {
    console.error('保存隐私设置失败:', error)
    ElMessage.error('保存失败')
  } finally {
    savingPrivacy.value = false
  }
}

// 处理头像文件选择
const handleAvatarChange = (file) => {
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 2MB')
    return
  }
  
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file.raw)
}



// 确认头像上传
const confirmAvatarUpload = async () => {
  if (!avatarFile.value) {
    ElMessage.warning('请先选择图片')
    return
  }
  
  try {
    uploadingAvatar.value = true
    
    // 获取剪裁结果
    const cropResult = cropperRef.value?.getCropResult()
    console.log('剪裁结果:', cropResult)
    
    // TODO: 调用API上传头像，传递剪裁参数
    console.log('上传头像:', avatarFile.value, '剪裁参数:', cropResult)
    
    // 模拟上传成功
    basicForm.avatar = avatarPreview.value
    
    ElMessage.success('头像上传成功')
    showAvatarUpload.value = false
    
    // 清理临时数据
    avatarFile.value = null
    avatarPreview.value = ''
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('上传失败')
  } finally {
    uploadingAvatar.value = false
  }
}

// 取消头像上传
const cancelAvatarUpload = () => {
  showAvatarUpload.value = false
  avatarFile.value = null
  avatarPreview.value = ''
}

onMounted(() => {
  // 初始化表单数据
  if (userStore.user) {
    basicForm.username = userStore.user.username || ''
    basicForm.nickname = userStore.user.nickname || ''
    basicForm.email = userStore.user.email || ''
    basicForm.bio = userStore.user.bio || ''
    basicForm.avatar = userStore.user.avatar_url || ''
  }
})
</script>

<style scoped>
.account-settings-root {
  min-height: 100vh;
  background: var(--color-gray-light);
  display: flex;
  flex-direction: column;
}

.settings-container {
  display: flex;
  max-width: 1200px;
  margin: 80px auto 0;
  gap: 24px;
  padding: 0 20px;
  flex: 1;
}

.settings-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-header {
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  padding: 32px;
  text-align: center;
}

.settings-header h1 {
  margin: 0 0 8px 0;
  color: var(--color-gray-dark);
  font-size: 28px;
  font-weight: 600;
}

.settings-header p {
  margin: 0;
  color: var(--color-gray);
  font-size: 16px;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-card {
  border-radius: 12px;
  box-shadow: var(--shadow-card);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: var(--color-gray-dark);
  font-size: 18px;
  font-weight: 600;
}

/* 头像设置样式 */
.avatar-section {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.current-avatar {
  position: relative;
  cursor: pointer;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
}

.current-avatar:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay .el-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.avatar-overlay span {
  font-size: 12px;
}

.avatar-info {
  flex: 1;
}

.avatar-info p {
  margin: 4px 0;
  color: var(--color-gray);
  font-size: 14px;
}

/* 头像上传对话框样式 */
.avatar-upload-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-section {
  text-align: center;
}

.avatar-uploader {
  display: inline-block;
}

.upload-placeholder {
  width: 200px;
  height: 200px;
  border: 2px dashed var(--color-gray);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.upload-placeholder:hover {
  border-color: var(--color-blue);
}

.upload-placeholder .el-icon {
  font-size: 32px;
  color: var(--color-gray);
  margin-bottom: 8px;
}

.upload-placeholder span {
  color: var(--color-gray);
  font-size: 14px;
  margin-bottom: 4px;
}

.upload-placeholder p {
  color: var(--color-gray);
  font-size: 12px;
  margin: 0;
}

.crop-section {
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-container {
    flex-direction: column;
    padding: 0 16px;
  }
  
  .avatar-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .crop-container {
    width: 250px;
    height: 250px;
  }
  
  .crop-frame {
    width: 120px;
    height: 120px;
  }
}
</style> 