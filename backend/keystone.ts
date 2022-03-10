import { createAuth } from '@keystone-next/auth'
import { config, createSchema  } from '@keystone-next/keystone/schema'
import 'dotenv/config'
import { withItemData, statelessSessions}  from '@keystone-next/keystone/session'

import { User } from './schemas/User'
import { Product } from './schemas/Product'
import { ProductImage } from './schemas/ProductImage'
import { CartItem } from './schemas/CartItem'

import { insertSeedData } from './seed-data'
import { sendPasswordResetEmail } from './lib/mail';

const databaseURL = process.env.DATABASE_URL || 'mongodb://localhost:27017/shopper-keystone'

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360, // How long they stay signed in?
  secret: process.env.COOKIE_SECRET
}

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password']
  },
  passwordResetLink: {
    async sendToken(args) {
      // send the email
      await sendPasswordResetEmail(args.token, args.identity);
    },
  },
})

export default withAuth(config({
  server: {
    cors: {
      origin: [process.env.FRONTEND_URL],
      credentials: true
    }
  },
  db: {
    adapter: 'mongoose',
    url: databaseURL,
    async onConnect(keystone) {
      console.log('connect to the database!')
      if (process.argv.includes('--seed-data')) {
        await insertSeedData(keystone)
      }
    }
  },
  lists: createSchema({
    User,
    Product,
    ProductImage,
    CartItem
  }),
  ui: {
    isAccessAllowed: ({session}) => {
      return !!session?.data
    }
  },
  session: withItemData(statelessSessions(sessionConfig), {
    User: `id`
  })
}))

