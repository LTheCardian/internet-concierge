import os
import discord
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv('TOKEN')

class GluBot(discord.Client):
    async def on_ready(self):
        print(f'{self.user} is verbonden met discord')

bot = GluBot()
bot.run(TOKEN)