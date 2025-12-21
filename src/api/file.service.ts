import api from './axios.config'

export const fileService = {
  /**
   * Upload file to Minio
   * POST /api/Files/upload
   */
  upload: async (file: File, bucketName?: string): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    if (bucketName) {
      formData.append('bucketName', bucketName)
    }

    const response = await api.post<string>('/api/Files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response as unknown as string
  },

  /**
   * Download file from Minio
   * GET /api/Files/download?fileName=xxx&bucketName=yyy
   */
  download: async (fileName: string, bucketName?: string): Promise<Blob> => {
    const params = new URLSearchParams({ fileName })
    if (bucketName) {
      params.append('bucketName', bucketName)
    }

    const response = await api.get(`/api/Files/download?${params.toString()}`, {
      responseType: 'blob',
    })
    return response as unknown as Blob
  },

  /**
   * Delete file from Minio
   * DELETE /api/Files/delete?fileName=xxx&bucketName=yyy
   */
  delete: async (fileName: string, bucketName?: string): Promise<void> => {
    const params = new URLSearchParams({ fileName })
    if (bucketName) {
      params.append('bucketName', bucketName)
    }

    await api.delete(`/api/Files/delete?${params.toString()}`)
  },
}
