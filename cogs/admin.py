import discord
from discord.ext import commands

class Admin(commands.Cog):
    def __init__(self, client):
        self.client = client
        
    @commands.command(name='say', pass_context=True, aliases=["announcement"])
    async def say(self, ctx, *, msg):
        await ctx.message.delete()
        await ctx.send(msg)

def setup(client):
    client.add_cog(Admin(client))