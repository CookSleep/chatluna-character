import { Context } from 'koishi'
import { Config } from '..'

export function apply(ctx: Context, config: Config) {
    ctx.command('chatluna.character', '角色扮演相关命令')

    ctx.command(
        'chatluna.character.clear [target]',
        '清除当前会话或指定群组、私聊的聊天记录',
        {
            authority: 3
        }
    ).action(async ({ session }, target) => {
        const isDirect = target
            ? target.startsWith('private:') || target.startsWith('p:')
            : session.isDirect
        const id = target
            ? target.startsWith('private:')
                ? target.slice('private:'.length)
                : target.startsWith('p:')
                  ? target.slice('p:'.length)
                : target.startsWith('group:')
                  ? target.slice('group:'.length)
                  : target.startsWith('g:')
                    ? target.slice('g:'.length)
                  : target
            : isDirect
              ? session.userId
              : session.guildId

        if (!id) {
            await session.send('请检查你是否提供了群组或私聊用户 ID')
            return
        }

        const key = `${isDirect ? 'private' : 'group'}:${id}`
        const label = isDirect ? '私聊' : '群组'
        const hasTrigger = ctx.chatluna_character_trigger.get(key) != null
        const cleared = await ctx.chatluna_character.clear(key)

        if (!cleared && !hasTrigger) {
            await session.send(`未找到${label} ${id} 的聊天记录`)
            return
        }

        await ctx.chatluna_character_trigger.delete(key)
        await session.send(`已清除${label} ${id} 的聊天记录`)
    })
}
