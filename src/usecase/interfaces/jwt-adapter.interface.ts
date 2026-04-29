export interface JwtPayload {
  sub: string; // Sub significa subject, a quem pertence este token (Aqui tipicamente usa-se o id)
  roleId: string; // Adicionamos isto para que resolvers consigam saber se o user é client ou manager sem ter de ir à db (apenas pelo token)
  email: string;
}

export interface IJwtAdapter {
  sign(payload: JwtPayload): string;
  verify(token: string): JwtPayload;
}
