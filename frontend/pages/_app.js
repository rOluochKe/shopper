import NProgress from 'nprogress'
import Router from 'next/router'
import Page from '../components/Page'
import { ApolloProvider } from '@apollo/client'
import withData from '../lib/withData'

import '../components/styles/nprogress.css'

Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

function MyApp({ Component, pageProps, apollo }) {
  return (
    <ApolloProvider client={apollo}>
      <Page>
        <Component {...pageProps} />
      </Page>
    </ApolloProvider>
  )
}

MyApp.getInitialprops = async function ({ Component, ctx }) {
  let pageProps = {}
  if (Component.getInitialprops) {
    pageProps = await Component.getInitialprops(ctx)
  }

  pageProps.query = ctx.query
  return { pageProps }
}

export default withData(MyApp)
