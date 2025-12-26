import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }){
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <div className="page-content">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
