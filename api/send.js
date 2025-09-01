export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).send("Only POST allowed");
  const {action}=req.body;

  async function safeJson(resp){
    try {
      const text = await resp.text();
      return text ? JSON.parse(text) : {};
    } catch(e){
      return {error:"Invalid JSON from API"};
    }
  }

  try{
    if(action==="create-random"){
      // 1. Get random domain
      const d=await fetch("https://api.mail.tm/domains");
      const domains=await d.json();
      const domain=domains["hydra:member"][0].domain;

      // 2. Generate random username
      const username="user"+Math.floor(Math.random()*100000);
      const password="pass1234";
      const address=username+"@"+domain;

      // 3. Create account
      const r=await fetch("https://api.mail.tm/accounts",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({address,password})
      });
      const account = await safeJson(r);

      if(account.id){
        // 4. Login
        const l=await fetch("https://api.mail.tm/token",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({address,password})
        });
        const token = await safeJson(l);

        if(token.token){
          return res.json({token:token.token,email:address});
        } else {
          return res.status(500).json({error:"Login failed", details:token});
        }
      } else {
        return res.status(500).json({error:"Account creation failed", details:account});
      }
    }

    res.status(400).send("Unknown action");
  }catch(err){
    console.error(err);
    res.status(500).send({error:err.message});
  }
}
