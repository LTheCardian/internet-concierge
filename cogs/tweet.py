import discord
from discord.ext import commands
import tweepy
import os
from dotenv import load_dotenv
class Tweet(commands.Cog):
    def __init__(self, client):
        self.client = client
        load_dotenv()

        TAK = os.getenv('TAK')
        TSK = os.getenv('TSK')
        TAT = os.getenv('TAT')
        TATS = os.getenv('TATS')


        auth= tweepy.OAuthHandler(TAK, TSK)
        self.auth = auth
        auth.set_access_token(TAT, TATS)

        self.api = tweepy.API(auth)

    @commands.command()
    async def tweet(self, ctx, *, msg):
        self.api.update_status(msg)
        await ctx.send(f'Ik heb **{msg}** gepost op twitter')

def setup(client):
    client.add_cog(Tweet(client))        