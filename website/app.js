const lessons=[
['Orientation','How the Academy works, digital citizenship and safe learning.','academy/lessons/orientation.md'],
['Class 1','Internet Basics & Digital Literacy','academy/lessons/class-1-internet-digital-literacy.md'],
['Class 2','Cyber Security & Password Safety','academy/lessons/class-2-security-passwords.md'],
['Class 3','Digital Payments','academy/lessons/class-3-digital-payments.md'],
['Class 4','Git & GitHub','academy/lessons/class-4-git-github.md'],
['Class 5','Linux','academy/lessons/class-5-linux.md'],
['Class 6','Programming Basics','academy/lessons/class-6-programming.md'],
['Class 7','AI & Prompt Engineering','academy/lessons/class-7-ai-prompt-engineering.md'],
['Class 8','Bitcoin & Blockchain','academy/lessons/class-8-bitcoin-blockchain.md'],
['Class 9','Ethereum','academy/lessons/class-9-ethereum.md'],
['Class 10','Base & Stablecoins','academy/lessons/class-10-base-stablecoins.md'],
['Class 11','DeFi & Wallet Security','academy/lessons/class-11-defi-wallet-security.md'],
['Class 12','Web3, Testnets & Community','academy/lessons/class-12-web3-community.md'],
['Graduation','Responsible Digital Builder','academy/lessons/graduation.md']
];

document.querySelector('#lesson-grid').innerHTML=lessons.map(([k,title,url])=>`<article class="card"><h3>${k}</h3><p>${title}</p><a href="./lesson.html?src=${encodeURIComponent(url)}">Read lesson →</a></article>`).join('');

document.querySelector('#verify-form').addEventListener('submit',async(event)=>{
 event.preventDefault();
 const id=document.querySelector('#cert-id').value.trim().toUpperCase();
 const base=document.querySelector('#api-base').value.trim().replace(/\/$/,'');
 const output=document.querySelector('#verify-result');
 if(!base){output.textContent='Enter the public Academy runtime API URL to verify a live certificate.';return;}
 output.textContent='Verifying…';
 try{const response=await fetch(`${base}/verify/certificate/${encodeURIComponent(id)}`);const data=await response.json();output.textContent=response.ok?`✓ Verified\nGraduate: ${data.name}\nCertificate: ${data.id}\nIssued: ${new Date(data.issuedAt).toUTCString()}\nPDF: ${base}/certificate/${encodeURIComponent(data.id)}.pdf`: `Not verified: ${data.error||'unknown error'}`;}catch(error){output.textContent=`Verification request failed: ${error.message}`;}
});
