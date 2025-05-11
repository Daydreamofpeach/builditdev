import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const { code } = await readBody(event)
    const config = useRuntimeConfig()

    if (!code) {
      throw new Error('No code provided')
    }

    // Exchange code for access token
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: config.githubClientId,
        client_secret: config.githubClientSecret,
        code
      })
    })

    if (!response.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error_description || data.error)
    }

    return {
      access_token: data.access_token
    }
  } catch (error) {
    console.error('GitHub OAuth error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to authenticate with GitHub'
    })
  }
}) 