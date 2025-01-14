<!--src/views/user/home/index.vue-->
<template>
  <div class="university-search">
    <!-- 绿色背景header -->
    <div class="header-bg">
      <h1>院校库</h1>
    </div>

    <!-- 搜索区域 -->
    <div class="search-container">
      <el-card class="search-card" :body-style="{ padding: '24px' }">
        <!-- 搜索框 -->
        <div class="search-input-wrapper">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入院校名称"
            @keyup.enter.native="handleSearch"
            clearable
          >
            <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
          </el-input>
          <div class="search-tip">（注：本名单未包含港澳台地区高等学校）</div>
        </div>

        <!-- 筛选项 -->
        <div class="filter-section">
          <!-- 院校所在地 -->
          <div class="filter-item">
            <div class="filter-label">院校所在地</div>
            <div class="filter-content">
              <el-button
                v-for="item in filterOptions.provinces"
                :key="item"
                :type="searchForm.province === item ? 'success' : ''"
                size="small"
                @click="updateFilter('province', item)"
              >
                {{ item }}
              </el-button>
            </div>
          </div>

          <!-- 主管部门类别 -->
          <div class="filter-item">
            <div class="filter-label">主管部门类别</div>
            <div class="filter-content">
              <el-button
                v-for="item in filterOptions.departments"
                :key="item"
                :type="searchForm.adminDepartment === item ? 'success' : ''"
                size="small"
                @click="updateFilter('adminDepartment', item)"
              >
                {{ item }}
              </el-button>
            </div>
          </div>

          <!-- 办学层次 -->
          <div class="filter-item">
            <div class="filter-label">办学层次</div>
            <div class="filter-content">
              <el-button
                v-for="item in filterOptions.levels"
                :key="item"
                :type="searchForm.level === item ? 'success' : ''"
                size="small"
                @click="updateFilter('level', item)"
              >
                {{ item }}
              </el-button>
            </div>
          </div>

          <!-- 院校特性 -->
          <div class="filter-item">
            <div class="filter-label">院校特性</div>
            <div class="filter-content">
              <el-button
                v-for="item in filterOptions.types"
                :key="item"
                :type="searchForm.type === item ? 'success' : ''"
                size="small"
                @click="updateFilter('type', item)"
              >
                {{ item }}
              </el-button>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 高校列表 -->
      <el-card v-loading="listLoading" class="university-list">
        <!-- 列表头部 -->
        <div class="list-header">
          <div class="total-info">
            找到 {{ total }} 所高校
          </div>
        </div>

        <!-- 高校卡片 -->
        <div class="university-cards">
          <div
            v-for="item in universityList"
            :key="item.id"
            class="university-card"
            @click="handleUniversityClick(item)"
          >
            <div class="card-content">
              <!-- logo部分 -->
              <div class="logo-wrapper">
                <template v-if="item.logo && !logoLoadErrors.has(item.logo)">
                  <img
                    :src="getLogoUrl(item.logo)"
                    :alt="item.name + '的logo'"
                    class="university-logo"
                    @error="handleLogoError(item)"
                  >
                </template>
                <div v-else class="logo-placeholder">
                  <span>{{ item.name.substring(0, 2) }}</span>
                </div>
              </div>

              <div class="university-info">
                <div class="info-header">
                  <h2 class="university-name">{{ item.name }}</h2>
                </div>
                <div class="basic-info">
                  <el-tag size="small">{{ item.province }}</el-tag>
                  <el-tag size="small" type="warning">{{ item.adminDepartment }}</el-tag>
                  <el-tag size="small" type="info">{{ item.level }}</el-tag>
                  <el-tag size="small" type="success">{{ item.type }}</el-tag>
                </div>
                <div class="address-info" v-if="item.address">
                  <i class="el-icon-location"></i>
                  <span>{{ item.address }}</span>
                </div>
                <div v-if="item.features && item.features.length" class="features">
                  <el-tag
                    v-for="(feature, index) in item.features.split(',')"
                    :key="index"
                    effect="plain"
                    type="danger"
                    size="mini"
                  >
                    {{ feature }}
                  </el-tag>
                </div>
                <div class="contact-info" v-if="item.contactNumber || item.website">
                  <div v-if="item.contactNumber" class="contact-item">
                    <i class="el-icon-phone"></i>
                    <span>{{ item.contactNumber }}</span>
                  </div>
                  <div v-if="item.website" class="contact-item">
                    <i class="el-icon-link"></i>
                    <a :href="item.website" target="_blank" @click.stop>访问官网</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="listQuery.page"
            :page-sizes="[10, 20, 30, 50]"
            :page-size="listQuery.limit"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            background
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import defaultLogo from '@/assets/404_images/404.png'

export default {
  name: 'UniversitySearch',

  data() {
    return {
      searchForm: {
        keyword: '',
        province: '全部',
        adminDepartment: '全部',
        level: '全部',
        type: '全部'
      },
      filterOptions: {
        provinces: ['全部', '北京市', '上海市', '天津市', '重庆市', '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省', '湖北省', '湖南省', '广东省', '海南省', '四川省', '贵州省', '云南省', '陕西省', '甘肃省', '青海省', '内蒙古', '广西', '西藏', '宁夏', '新疆'],
        departments: ['全部', '教育部', '其他部委', '地方', '军校'],
        levels: ['全部', '双一流', '985', '211', '普通高校'],
        types: ['全部', '公立', '私立']
      },
      listQuery: {
        page: 1,
        limit: 10
      },
      logoLoadErrors: new Set() // 记录加载失败的logo
    }
  },

  computed: {
    ...mapState({
      universityList: state => state.university.list?.records || [],
      total: state => state.university.list?.total || 0,
      listLoading: state => state.university.listLoading
    })
  },

  created() {
    this.fetchData()
  },

  methods: {
    // 获取logo URL
    getLogoUrl(logo) {
      // 如果没有 logo，返回默认 logo
      if (!logo) {
        return defaultLogo
      }

      // 如果是完整的 URL，直接返回
      if (logo.startsWith('http')) {
        return logo
      }

      // 如果是相对路径，需要转换为正确的资源引用
      try {
        // 处理相对路径
        if (logo.includes('/')) {
          let relativePath = logo
          // 确保路径以 images/ 开头
          if (!logo.startsWith('images/')) {
            relativePath = `images/${logo.split('/').pop()}`
          }
          return require(`@/assets/${relativePath}`)
        }
        // 如果只是文件名，假设在 images 目录下
        return require(`@/assets/images/${logo}`)
      } catch (error) {
        console.warn(`Logo loading failed for: ${logo}`, error)
        return defaultLogo
      }
    },

    handleLogoError(item) {
      const imgElement = window.event?.target
      if (imgElement) {
        imgElement.src = defaultLogo
        // 防止循环触发 error 事件
        imgElement.onerror = null
        // 如果已经显示了默认图片，则不再重试加载
        this.logoLoadErrors.add(item.logo)
      }
    },

    // 获取高校列表数据
    async fetchData() {
      try {
        // 构建查询参数
        const params = {
          page: this.listQuery.page,
          limit: this.listQuery.limit,
          name: this.searchForm.keyword || undefined,
          province: this.searchForm.province === '全部' ? undefined : this.searchForm.province,
          type: this.searchForm.type === '全部' ? undefined : this.searchForm.type,
          level: this.searchForm.level === '全部' ? undefined : this.searchForm.level,
          adminDepartment: this.searchForm.adminDepartment === '全部' ? undefined : this.searchForm.adminDepartment
        }

        // 清除undefined的属性
        Object.keys(params).forEach(key => {
          if (params[key] === undefined) {
            delete params[key]
          }
        })

        // 调用获取列表的 action
        await this.$store.dispatch('university/getList', params)
      } catch (error) {
        console.error('获取高校列表失败:', error)
        this.$message.error('获取高校列表失败，请稍后重试')
      }
    },

    // 更新筛选条件
    updateFilter(key, value) {
      this.searchForm[key] = value
      this.listQuery.page = 1
      this.fetchData()
    },

    // 搜索
    handleSearch() {
      this.listQuery.page = 1
      this.fetchData()
    },

    // 改变每页数量
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.fetchData()
    },

    // 改变页码
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.fetchData()
    },

    // 点击高校卡片
    handleUniversityClick(university) {
      this.$router.push({
        name: 'UniversityDetail',
        params: { id: university.id.toString() }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.university-search {
  min-height: 100vh;
  background-color: #f5f7fa;

  .header-bg {
    height: 200px;
    background-color: #10b981;
    display: flex;
    align-items: center;
    justify-content: center;

    h1 {
      color: #ffffff;
      font-size: 32px;
      font-weight: bold;
    }
  }

  .search-container {
    max-width: 1200px;
    margin: -60px auto 0;
    padding: 0 20px 40px;
  }

  .search-card {
    margin-bottom: 20px;

    .search-input-wrapper {
      margin-bottom: 24px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;

      .search-tip {
        margin-top: 8px;
        color: #909399;
        font-size: 14px;
        text-align: center;
      }

      ::v-deep .el-input {
        .el-input__inner {
          height: 48px;
          line-height: 48px;
          font-size: 16px;
          border-radius: 24px;
          padding-left: 20px;

          &:focus {
            border-color: #10b981;
          }
        }

        .el-input-group__append {
          border-top-right-radius: 24px;
          border-bottom-right-radius: 24px;
          background-color: #10b981;
          border-color: #10b981;
          padding: 0 20px;

          .el-button {
            color: white;
          }

          &:hover {
            background-color: #0ea371;
          }
        }
      }
    }
  }

  .filter-section {
    .filter-item {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .filter-label {
        width: 100px;
        color: #606266;
        margin-bottom: 8px;
      }

      .filter-content {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .el-button {
          margin: 0;
        }
      }
    }
  }

  .university-list {
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .total-info {
        color: #606266;
        font-size: 14px;
      }
    }

    .university-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .university-card {
        background: #fff;
        border-radius: 8px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px solid #ebeef5;

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .card-content {
          display: flex;
          align-items: flex-start;
          gap: 16px;

          .logo-wrapper {
            flex-shrink: 0;
            width: 80px;
            height: 80px;
            border-radius: 8px;
            overflow: hidden;
            background-color: #f5f7fa;
            display: flex;
            align-items: center;
            justify-content: center;

            .university-logo {
              width: 100%;
              height: 100%;
              object-fit: contain;
              background-color: #fff;
            }

            .logo-placeholder {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: #e5e7eb;

              span {
                font-size: 24px;
                font-weight: bold;
                color: #6b7280;
              }
            }
          }

          .university-info {
            flex: 1;
            min-width: 0;

            .info-header {
              margin-bottom: 12px;

              .university-name {
                font-size: 18px;
                font-weight: bold;
                color: #303133;
                margin: 0;
                @media (max-width: 768px) {
                  font-size: 16px;
                }
              }
            }

            .basic-info {
              display: flex;
              gap: 8px;
              margin-bottom: 12px;
              flex-wrap: wrap;

              .el-tag {
                margin: 0;
              }
            }

            .address-info {
              color: #606266;
              font-size: 14px;
              margin: 12px 0;
              display: flex;
              align-items: flex-start;
              gap: 4px;

              i {
                color: #909399;
                margin-top: 3px;
              }

              span {
                flex: 1;
                word-break: break-all;
              }
            }

            .features {
              margin-top: 12px;
              display: flex;
              gap: 8px;
              flex-wrap: wrap;

              .el-tag {
                margin: 0;
              }
            }

            .contact-info {
              margin-top: 12px;
              display: flex;
              gap: 16px;
              color: #606266;
              font-size: 14px;
              flex-wrap: wrap;

              .contact-item {
                display: flex;
                align-items: center;
                gap: 4px;

                i {
                  color: #909399;
                }

                a {
                  color: #409EFF;
                  text-decoration: none;

                  &:hover {
                    color: #66b1ff;
                    text-decoration: underline;
                  }
                }
              }
            }
          }
        }
      }
    }

    .pagination {
      margin-top: 24px;
      text-align: center;
      padding: 24px 0;
    }
  }
}

::v-deep .el-button--success {
  background-color: #10b981;
  border-color: #10b981;

  &:hover,
  &:focus {
    background-color: #34d399;
    border-color: #34d399;
  }

  &:active {
    background-color: #059669;
    border-color: #059669;
  }
}

// 适配移动端
@media (max-width: 768px) {
  .university-search {
    .search-container {
      padding: 0 12px 24px;
    }

    .filter-section {
      .filter-content {
        .el-button {
          margin-bottom: 8px;
        }
      }
    }

    .university-list {
      .university-cards {
        .university-card {
          padding: 16px;

          .card-content {
            .logo-wrapper {
              width: 60px;
              height: 60px;
            }

            .university-info {
              .basic-info,
              .features {
                gap: 4px;
              }

              .contact-info {
                flex-direction: column;
                gap: 8px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
