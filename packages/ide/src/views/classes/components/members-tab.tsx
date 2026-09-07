export function MembersTab({
  teacher,
  members,
  exercises,
  classAveragePct,
}: {
  teacher: any;
  members: any[];
  exercises: any[];
  classAveragePct: number;
}) {
  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Members List Section */}
      <div className="col-span-12 lg:col-span-8 space-y-8">
        {/* Teacher Card */}
        {teacher && (
          <section>
            <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-4">Professor</h3>
            <div className="bg-card/80 dark:bg-white/5 backdrop-blur-md p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-[#0dccf2] border border-border dark:border-white/10 shadow-[0_8px_32px_rgba(13,204,242,0.1)]">
              <div className="flex items-center gap-5">
                <div className="relative">
                  {teacher.avatarUrl ? (
                    <img src={teacher.avatarUrl} alt={teacher.name} className="w-16 h-16 rounded-2xl border-2 border-[#0dccf2]/20" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#0dccf2]/20 flex items-center justify-center text-[#0dccf2] text-xl font-bold border-2 border-[#0dccf2]/20">
                      {teacher.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-[#0dccf2] text-slate-900 text-[10px] font-black px-2 py-1 rounded-md shadow-lg">PRO</div>
                </div>
                <div>
                  <h4 className="text-foreground text-lg font-bold">{teacher.name}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-[#0dccf2]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Verified
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> {teacher.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Students Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Estudantes ({members.length})</h3>
          </div>
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-card/70 dark:bg-white/2 rounded-2xl border border-border dark:border-white/5 backdrop-blur-xl">
              <p className="text-muted-foreground text-sm font-medium">Nenhum estudante inscrito nesta turma ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((member: any) => (
                <div key={member.id} className="bg-card/80 dark:bg-white/5 border border-border dark:border-white/5 p-4 rounded-xl flex items-center justify-between hover:border-[#0dccf2]/50 transition-colors">
                  <div className="flex items-center gap-4">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="w-12 h-12 rounded-xl" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-muted dark:bg-white/10 flex items-center justify-center text-foreground dark:text-white font-bold border border-border dark:border-white/5">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-foreground text-sm font-bold">{member.name}</p>
                      <p className="text-muted-foreground text-xs truncate max-w-[120px]">{member.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-2 py-1 bg-[#0dccf2]/10 text-[#0dccf2] rounded text-[10px] font-bold">
                      {member.progress?.completed || 0}/{member.progress?.total || 0} CONCLUÍDOS
                    </div>
                    <div className="w-20 h-1 bg-muted dark:bg-black/40 rounded-full mt-2 ml-auto overflow-hidden">
                      <div className="h-full bg-[#0dccf2]" style={{ width: `${member.progress?.percentage || 0}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Right Stats Sidebar */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="bg-card/80 dark:bg-white/5 border border-border dark:border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h3 className="text-foreground font-bold mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#0dccf2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Turma Stats
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground text-sm">Total de Estudantes</span>
                <span className="text-foreground font-bold">{members.length}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground text-sm">Total de Exercícios</span>
                <span className="text-foreground font-bold">{exercises.length}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground text-sm">Média de Conclusões</span>
                <span className="text-foreground font-bold">{classAveragePct.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-muted dark:bg-black/40 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-[#0dccf2] to-[#10b981]" style={{ width: `${classAveragePct}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
