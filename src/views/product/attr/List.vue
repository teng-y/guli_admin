<template>
  <div>
    <el-card>
      <CategorySelector @changeCategory="changeCategory"></CategorySelector>
    </el-card>
    <el-card style="margin-top:20px">
      <!-- 列表界面 -->
      <div v-show="isShowAttrList">
        <el-button type="primary" icon="el-icon-plus" @click="showAddDiv">添加属性</el-button>
        <el-table :data="attrList" style="width:100%" border>
          <el-table-column type="index" label="序号" width="80"></el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="150"></el-table-column>
          <el-table-column prop="prop" label="属性值列表" width="width">
            <template slot-scope="{row}">
              <el-tag
                type="success"
                v-for="attrValue in row.attrValueList"
                :key="attrValue.id"
              >{{attrValue.valueName}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <template>
              <HintButton
                style="margin-right:10px"
                type="warning"
                icon="el-icon-edit"
                size="mini"
                title="修改"
              ></HintButton>
              <HintButton type="danger" icon="el-icon-delete" size="mini" title="删除"></HintButton>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 添加或修改界面 -->
      <div v-show="!isShowAttrList">
        <el-form :inline="true" :model="attrForm">
          <el-form-item label="属性名">
            <el-input v-model="attrForm.attrName" placeholder="请输入属性名"></el-input>
          </el-form-item>
        </el-form>
        <el-button type="primary" icon="el-icon-plus" @click="addAttrValue">添加属性值</el-button>
        <el-button>取消</el-button>
        <el-table :data="attrForm.attrValueList" border style="width: 100% ;margin:20px 0">
          <el-table-column type="index" label="序号" width="80"></el-table-column>
          <el-table-column prop="prop" label="属性值名称" width="width">
            <template slot-scope="{row}">
              <el-input v-model="row.valueName" placeholder="请输入属性值名称"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width"></el-table-column>
        </el-table>
        <el-button type="primary">确认</el-button>
        <el-button @click="isShowAttrList=true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      attrList: [],
      isShowAttrList: true,

      attrForm: {
        //第一步：先让table展示这个属性值数组
        //第二步：点击添加属性值按钮，往属性值数组中添加一个数据
        //这个数据的格式是一个对象，对象里面的属性包含attrId和valueName
        //添加这个对象的时候，valueName是空的，留着后期让用户输入

        //第三步：数据添加会造成table表格会展示一行，我们可以在这行当中显示一个input框，让用户去输入想要的属性值名称
        //attrId的值，是当前这个属性所属属性的id
        attrName: "",
        attrValueList: [
          // {
          //   attrId: 0,
          //   valueName: ""
          // }
        ],
        categoryId: "",
        categoryLevel: 3
      }
    };
  },
  methods: {
    changeCategory({ categoryId, level }) {
      if (level === 1) {
        this.attrList = [];
        this.category2Id = "";
        this.category3Id = "";

        this.category1Id = categoryId;
      } else if (level === 2) {
        this.attrList = [];
        this.category3Id = "";
        this.category2Id = categoryId;
      } else {
        this.category3Id = categoryId;

        //发请求获取属性列表
        this.getAttrList();
      }
    },
    async getAttrList() {
      let { category1Id, category2Id, category3Id } = this;
      try {
        const result = await this.$API.attr.getList(
          category1Id,
          category2Id,
          category3Id
        );
        if (result.code === 200 || result.code === 20000) {
          this.attrList = result.data;
        } else {
          this.$message.error("获取属性列表失败");
        }
      } catch (error) {
        this.$message.error("请求获取属性列表失败");
      }
    },
    //点击添加属性按钮显示添加属性界面
    showAddDiv() {
      this.isShowAttrList = false;
    },
    addAttrValue() {
      this.attrForm.attrValueList.push({
        attrId: this.attrForm.id,
        valueName: ""
      });
    }
  }
};
</script>

<style>
</style>