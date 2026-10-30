const required=['DB_HOST','DB_PORT','DB_USER','DB_PASSWORD','DB_NAME','JWT_SECRET'];
for(const key of required)if(!process.env[key])throw new Error('Missing environment variable '+key);
if(process.env.NODE_ENV!=='production' && (!['127.0.0.1','localhost'].includes(process.env.DB_HOST)||!process.env.DB_NAME.endsWith('_test')))throw new Error('Local mode requires a loopback test database');
module.exports={secret:process.env.JWT_SECRET,database:{host:process.env.DB_HOST,port:Number(process.env.DB_PORT),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,connectTimeout:5000}};
