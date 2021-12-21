<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" style="margin-top:10px" @click="showAddDialog">添加</el-button>
    <el-table :data="trademarkList" style="width: 100%;margin:20px 0" border>
      <el-table-column label="序号" width="width" align="center" type="index"></el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width"></el-table-column>
      <el-table-column label="品牌LOGO" width="width">
        <template slot-scope="{row}">
          <img :src="row.logoUrl" alt=" " style="width:80px;height:60px" />
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="操作" width="width">
        <template slot-scope="{row}">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="showUpdateDialog(row)"
          >修改</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="delTrademark(row.id)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--分页器 -->
    <!-- layout修改摆放位置 -->
    <el-pagination
      layout=" prev, pager, next, jumper,->,sizes,total"
      style="text-align:center"
      @current-change="getTrademarkList"
      @size-change="handleSizeChange"
      :page-sizes="[3, 5, 10]"
      :current-page="page"
      :page-size="limit"
      :pager-count="5"
      :total="total"
      background
    ></el-pagination>

    <!-- 增加修改功能弹窗 -->
    <el-dialog :title="tmForm.id?'修改品牌':'添加品牌'"  :visible.sync="dialogFormVisible">
      <el-form style="width:80%" :model="tmForm" :rules="rules" ref="tmForm">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input autocomplete="off" v-model="tmForm.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <!-- 上传图片显示框 -->
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload/"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
          </el-upload>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTrademark">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Trademark",
  data() {
    var validateTmName = (rule, value, callback) => {
      // callback这个函数代表验证通过还是不通过
      // 调用函数的时候传递参数，代表不通过，一般传递的都是错误对象
      // 调用函数的时候不传递参数，代表通过
      if (value.length < 2 || value.length > 10) {
        callback(new Error("品牌名称在2-10之间"));
      } else {
        callback();
      }
    };
    return {
      page: 1,
      limit: 3,
      total: 1,
      trademarkList: [],
      dialogFormVisible: false, //控制Dialog弹出与否
      imageUrl: "",
      tmForm: {
        tmName: "",
        logoUrl: ""
      },
      rules: {
        tmName: [
          { required: true, message: "请输入品牌名称", trigger: "blur" },
          { validator: validateTmName, trigger: "change" }
        ],
        logoUrl: [
          { required: true, message: "请选择上传图片"}
        ]
      }
    };
  },
  mounted() {
    this.getTrademarkList();
  },
  methods: {
    async getTrademarkList(page = 1) {
      this.page = page;
      try {
        const result = await this.$API.trademark.getPageList(
          this.page,
          this.limit
        );
        if (result.code === 200 || result.code === 20000) {
          this.total = result.data.total;
          this.trademarkList = result.data.records;
        } else {
          alert("获取品牌列表失败");
        }
      } catch (error) {
        alert("请求获取品牌列表失败");
      }
    },
    //这个是切换每页数量的回调,这个回调不能省略
    handleSizeChange(size) {
      this.limit = size;
      this.getTrademarkList();
    },

    handleAvatarSuccess(res, file) {
      //   this.imageUrl = URL.createObjectURL(file.raw);
      //   console.log(res, file);
      this.tmForm.logoUrl = res.data || file.response.data;
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },

    //点击添加显示对话框
    showAddDialog() {
      this.dialogFormVisible = true;

      // 解决添加之后取消，再次点击添加，数据还存在的问题
      // 每次点击添加按钮，需要清空数据
      this.tmForm = {
        tmName: "",
        logoUrl: ""
      };
    },
    //点击修改弹出对话框
    showUpdateDialog(raw) {
      this.dialogFormVisible = true;
      this.tmForm = { ...raw };
    },
    // 点击确定按钮，添加或者修改品牌
    addOrUpdateTrademark() {
      this.$refs.tmForm.validate(async valid => {
        if (valid) {
          //1、获取请求参数
          let trademark = this.tmForm;
          //2、处理数据
          //3、发送请求
          try {
            //4、成功干啥
            const result = await this.$API.trademark.addOrUpdate(trademark);
            if (result.code === 200 || result.code === 20000) {
              //判断是否trademark中是否有id，有的话是修改，没的话是添加
              //如果是修改的话，修改后显示的页数为当前页
              //如果是添加的话，页数为第一页
              this.getTrademarkList(trademark.id ? this.page : "1");
              this.$message.success(
                trademark.id ? "修改数据成功" : "添加数据成功"
              );
              this.dialogFormVisible = false;
            } else {
              //失败干啥
              alert(trademark.id ? "修改数据失败" : "添加数据失败");
            }
          } catch (error) {
            alert(trademark.id ? "请求修改数据失败" : "请求添加数据失败");
            this.dialogFormVisible = false;
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    //删除品牌
    delTrademark(id) {
      this.$confirm("此操作将永久删除该品牌, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          try {
            const result = await this.$API.trademark.remove(id);
            if (result.code === 200 || result.code === 20000) {
              this.getTrademarkList(
                this.trademarkList.length > 1 ? this.page : this.page - 1
              );
            } else {
              this.$message.error("删除失败");
            }
            this.$message({
              type: "success",
              message: "删除成功!"
            });
          } catch (error) {}
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    }
  }
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>