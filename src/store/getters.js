const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  universityList: state => state.university.list,
  universityTotal: state => state.university.list.total,
  currentUniversity: state => state.university.currentUniversity,
  listLoading: state => state.university.listLoading,
  detailLoading: state => state.university.detailLoading,
  userId: state => state.user.userId,
  role: state => state.user.role
}
export default getters
