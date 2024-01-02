<script setup lang="ts">
import { ref } from 'vue'
import { ElLoading, ElMessage } from 'element-plus'

const encryptFilePath = ref('')
const decryptFolderPath = ref('')
async function getEncryptFile() {
  const [path] = await window.ipcRenderer.invoke('select-file')
  encryptFilePath.value = path
}
async function setDecryptFolder() {
  const [path] = await window.ipcRenderer.invoke('select-folder')
  decryptFolderPath.value = path
}
async function decryptFile() {
  if (encryptFilePath.value === '') {
    ElMessage({
      message: '请选择文件',
      type: 'warning',
    })
    return
  }
  if (decryptFolderPath.value === '') {
    ElMessage({
      message: '请选择目录',
      type: 'warning',
    })
    return
  }
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '解密中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  try {
    const res: string = await window.ipcRenderer.invoke('decrypt-file', encryptFilePath.value, decryptFolderPath.value)
    const isSuccess = res.replace(/[ \n]+/g, '') === 'true'
    ElMessage({
      message: `解密${isSuccess ? '成功' : '失败'}`,
      type: isSuccess ? 'success' : 'error',
    })
    loadingInstance.close()
  }
  catch (error: any) {
    ElMessage({
      message: error.message,
      type: 'error',
    })
    loadingInstance.close()
  }
}
async function openFolder() {
  if (decryptFolderPath.value === '') {
    ElMessage({
      message: '请选择目录',
      type: 'warning',
    })
    return
  }
  await window.ipcRenderer.invoke('open-path', decryptFolderPath.value)
  ElMessage({
    message: `打开目录:${decryptFolderPath.value}成功`,
    type: 'success',
  })
}
</script>

<template>
  <div class="w-100%" px-20px flex flex-col gap15px>
    <el-alert
      title="Tips"
      type="warning"
      description="不建议输出目录和选择的文件在同一个目录下，否则会覆盖原文件"
      show-icon
      :closable="false"
    />
    <div flex items-center gap10px>
      <el-text>选择的文件:</el-text>
      <div
        grow-1
        h-30px
      >
        <el-input v-model="encryptFilePath" disabled placeholder="请选择文件" />
      </div>
      <el-button color="#626aef" @click="getEncryptFile">选择</el-button>
    </div>
    <div flex items-center gap10px>
      <el-text>输出的目录:</el-text>
      <div
        grow-1
        h-30px
      >
        <el-input v-model="decryptFolderPath" disabled placeholder="请选择目录" />
      </div>
      <div flex items-center gap5px>
        <el-button color="#626aef" @click="setDecryptFolder">选择</el-button>
      </div>
    </div>
    <div flex justify-center gap10px>
      <el-button color="#626aef" @click="decryptFile">解密文件</el-button>
      <el-button color="#626aef" @click="openFolder">打开目录</el-button>
      <!-- <CusButton @click="openFolder">打开目录</CusButton> -->
    </div>
    <el-text>
      <el-icon>
        <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" width="1.2em" height="1.2em" data-v-6c8d2bba=""><path fill="currentColor" d="M12 2C6.475 2 2 6.475 2 12a9.994 9.994 0 0 0 6.838 9.488c.5.087.687-.213.687-.476c0-.237-.013-1.024-.013-1.862c-2.512.463-3.162-.612-3.362-1.175c-.113-.288-.6-1.175-1.025-1.413c-.35-.187-.85-.65-.013-.662c.788-.013 1.35.725 1.538 1.025c.9 1.512 2.338 1.087 2.912.825c.088-.65.35-1.087.638-1.337c-2.225-.25-4.55-1.113-4.55-4.938c0-1.088.387-1.987 1.025-2.688c-.1-.25-.45-1.275.1-2.65c0 0 .837-.262 2.75 1.026a9.28 9.28 0 0 1 2.5-.338c.85 0 1.7.112 2.5.337c1.912-1.3 2.75-1.024 2.75-1.024c.55 1.375.2 2.4.1 2.65c.637.7 1.025 1.587 1.025 2.687c0 3.838-2.337 4.688-4.562 4.938c.362.312.675.912.675 1.85c0 1.337-.013 2.412-.013 2.75c0 .262.188.574.688.474A10.016 10.016 0 0 0 22 12c0-5.525-4.475-10-10-10z" /></svg>
      </el-icon>
      <el-link ml-1 href="https://element-plus.org" target="_blank">Electron</el-link>
    </el-text>
  </div>
</template>
