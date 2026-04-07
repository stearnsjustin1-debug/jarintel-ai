import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>JAR Intelligence</title>
        <meta name="description" content="JAR Intelligence — AI Tools" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <main style={{
        background: '#000',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'JetBrains Mono', monospace"
      }}>
        <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg" style={{width: 'clamp(220px, 50vw, 380px)', height: 'auto', fillRule:'evenodd', clipRule:'evenodd'}}>
          <g transform="matrix(1,0,0,1,1.5,1.48917)" style={{fill:'#fff',stroke:'#fff',strokeWidth:'0.42px'}}>
            <path d="M286,71L11,71L11,74L286,74L286,71"/>
            <path d="M125,47L132,40L150,40L156,47L125,47Z"/>
            <path d="M92,63L130,7L154,7L191,63L171,63L142,18L109,63L92,63"/>
            <rect x="193" y="28" width="19" height="35"/>
            <path d="M193,8L193,21L248,21C248,21 252.966,20.964 253,26C253.034,31.036 249.822,32.016 248,32C246.178,31.984 220,32 220,32L254,63L279,63L254,43C254,43 272.271,44.746 272,26C271.729,7.254 255,8 255,8L193,8Z"/>
            <path d="M24,80L27,80L27,90L24,90L24,80"/>
            <path d="M39,80L39,90L42,90L42,83L49,90L52,90L52,80L49,80L49,87L42,80L39,80"/>
            <path d="M70,90L67,90L67,82L62,82L62,80L75,80L75,82L70,82L70,90"/>
            <path d="M86,80L86,90L97,90L97,88L89,88L89,86L97,86L97,84L89,84L89,82L97,82L97,80L86,80"/>
            <path d="M109,90L109,80L112,80L112,88L120,88L120,90L109,90Z"/>
            <path d="M131,90L131,80L134,80L134,88L142,88L142,90L131,90"/>
            <path d="M154,80L157,80L157,90L154,90L154,80"/>
            <path d="M171,83L171,87L172,88L179,88L180,87L180,86L175,86L175,84L182,84L182,87C182,87 181.446,89.951 179,90C176.554,90.049 172,90 172,90C172,90 169.042,89.884 169,87C168.958,84.116 169,83 169,83C169,83 168.81,79.925 172,80C175.19,80.075 179,80 179,80C179,80 181.981,79.938 182,83L180,83L179,82L172,82L171,83"/>
            <path d="M29,50L68,50C68,50 74.945,50.27 75,45L75,7L95,7L95,45C95.003,64.931 75,63 75,63L18,63L29,50L18,63"/>
          </g>
          <g transform="matrix(1,0,0,1,72.587072,1.48917)" style={{fill:'#fff',stroke:'#fff',strokeWidth:'0.42px'}}>
            <path d="M171,83L171,86.991L172,87.991L178,87.991L179,86.991L181,86.991C180.981,90.053 179,89.991 179,89.991C179,89.991 175.19,89.917 172,89.991C168.81,90.066 169,86.991 169,86.991L168.984,83.993C168.989,83.3 169,83 169,83C169,83 168.81,79.925 172,80C175.19,80.075 179,80 179,80C179,80 180.981,79.938 181,83L179,83L178,82L172,82L171,83Z"/>
          </g>
          <g transform="matrix(1,0,0,1,178.392261,1.48917)" style={{fill:'#fff',stroke:'#fff',strokeWidth:'0.42px'}}>
            <path d="M39,80L39,90L42,90L42,83L49,90L52,90L52,80L49,80L49,87L42,80L39,80"/>
          </g>
          <g transform="matrix(1,0,0,1,108.444042,1.48917)" style={{fill:'#fff',stroke:'#fff',strokeWidth:'0.42px'}}>
            <path d="M86,80L86,90L97,90L97,88L89,88L89,86L97,86L97,84L89,84L89,82L97,82L97,80L86,80"/>
          </g>
          <g transform="matrix(1,0,0,1,178.929888,1.48917)" style={{fill:'#fff',stroke:'#fff',strokeWidth:'0.42px'}}>
            <path d="M86,80L86,90L97,90L97,88L89,88L89,86L97,86L97,84L89,84L89,82L97,82L97,80L86,80"/>
          </g>
        </svg>

        <div style={{width:'1px', height:'48px', background:'#222', margin:'36px 0'}} />

        <button
          onClick={() => router.push('/free-tools')}
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#777',
            background: 'transparent',
            border: '0.5px solid #2a2a2a',
            padding: '14px 36px',
            cursor: 'pointer'
          }}
          onMouseEnter={e => { e.target.style.color='#fff'; e.target.style.borderColor='#777' }}
          onMouseLeave={e => { e.target.style.color='#777'; e.target.style.borderColor='#2a2a2a' }}
        >
          Explore Free Tools
        </button>
      </main>
    </>
  )
}