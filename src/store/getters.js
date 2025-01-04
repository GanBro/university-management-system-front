const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  // 添加university相关的getters
  universityList: state => state.university.list,
  universityTotal: state => state.university.total,
  currentUniversity: state => state.university.currentUniversity,
  listLoading: state => state.university.listLoading,
  detailLoading: state => state.university.detailLoading
}
export default getters
