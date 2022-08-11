# TelegramBotAlertasTrafico
Bot para grupo de alertas de tráfico de telegram: https://t.me/alertastenerifechat
Su principal función es obtener la información de las cuentas oficiales de Twitter de canarias: @carreterasSC @112Canarias y @PoliciaLocalSC. Los mensajes pasarán por un filtro, que descartará los que no entren dentro de la temática de carreteras y posteriormente serán publicados en el nuestro canal si el tema es actual, o en el grupo si son datos irrelevantes para el momento(Accidentes pasados, datos de tráfico...). 
### Variables de entorno

Token del bot
```
BOT_TOKEN
```
Ids Usuarios administradores Telegram
```
BOT_AdminUsers
```
Id Canal donde se enviarán los tweets
```
BOT_ChannelToSend
```
Bearer token de twitter developer
```
Twitter_token
```

JSON de las cuentas de twitter Array de cuentas(Id, name) -> [{"id": 123, "name": "ejemplo"}] 
```
Twitter_Accounts
```
