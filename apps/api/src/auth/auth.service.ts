import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

interface WechatSessionResponse { openid?: string; errcode?: number; errmsg?: string }

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  async loginWithWechatCode(code: string) {
    const appId = process.env.WECHAT_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;
    if (!appId || !appSecret) throw new ServiceUnavailableException('微信登录服务尚未配置');

    const url = new URL('https://api.weixin.qq.com/sns/jscode2session');
    url.searchParams.set('appid', appId);
    url.searchParams.set('secret', appSecret);
    url.searchParams.set('js_code', code);
    url.searchParams.set('grant_type', 'authorization_code');
    const response = await fetch(url);
    const session = (await response.json()) as WechatSessionResponse;
    if (!response.ok || !session.openid) throw new UnauthorizedException(session.errmsg || '微信登录失败');

    const user = await this.prisma.user.upsert({
      where: { wechatOpenId: session.openid },
      update: {},
      create: { wechatOpenId: session.openid },
    });
    const accessToken = await this.jwtService.signAsync({ sub: user.id, openId: user.wechatOpenId });
    return { accessToken, expiresIn: 60 * 60 * 24 * 7, user: { id: user.id } };
  }
}
