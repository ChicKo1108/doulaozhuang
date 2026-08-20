const api=require('../../utils/cloud-api');
const STATUS={UNSTARTED:{label:'未拼',note:'收进图纸夹，以后再拼'},IN_PROGRESS:{label:'正在拼',note:'已经开工，继续完成它'},COMPLETED:{label:'已拼',note:'这张作品已经完成'}};
Page({
  data:{patternId:'',pattern:null,previewPath:'',constructionPath:'',tab:'preview',loading:true,completing:false,statusMap:STATUS,showCompleteDialog:false,vaults:[],selectedVaultId:'',completeError:''},
  onLoad(options){this.setData({patternId:options.id||''});this.load()},
  onPullDownRefresh(){this.load().finally(()=>wx.stopPullDownRefresh())},
  async load(){const vaultId=getApp().globalData.activeVaultId;if(!vaultId||!this.data.patternId)return;this.setData({loading:true});try{const pattern=await api.getPattern(vaultId,this.data.patternId),jobs=[];if(pattern.previewUrl)jobs.push(api.downloadPatternAsset(pattern.previewUrl));else jobs.push(Promise.resolve(''));if(pattern.constructionUrl)jobs.push(api.downloadPatternAsset(pattern.constructionUrl));else jobs.push(Promise.resolve(''));const paths=await Promise.all(jobs);this.setData({pattern,previewPath:paths[0],constructionPath:paths[1],loading:false});wx.setNavigationBarTitle({title:pattern.name})}catch(e){this.setData({loading:false});wx.showToast({title:e.message||'图纸读取失败',icon:'none'})}},
  setTab(e){this.setData({tab:e.currentTarget.dataset.value})},
  previewImage(){const path=this.data.tab==='preview'?this.data.previewPath:this.data.constructionPath;if(path)wx.previewImage({current:path,urls:[path]})},
  async rename(){const p=this.data.pattern;if(!p)return;const r=await wx.showModal({title:'重命名图纸',editable:true,placeholderText:'输入图纸名称',content:p.name,confirmText:'保存'});if(!r.confirm||!r.content.trim())return;await this.update({name:r.content.trim()},'名称已更新')},
  async setStatus(e){const status=e.currentTarget.dataset.value;if(status==='COMPLETED')return this.openCompleteDialog();await this.update({status},'状态已更新')},
  async openCompleteDialog(){if(this.data.completing||this.data.pattern.status==='COMPLETED')return;try{wx.showLoading({title:'正在查看豆仓'});const vaults=await api.listVaults();wx.hideLoading();if(!vaults.length)return wx.showModal({title:'还没有豆仓',content:'请先到“我的豆仓”创建豆仓并录入库存，再回来完成扣料。',showCancel:false,confirmText:'知道了'});const preferred=vaults.find(v=>v.id===getApp().globalData.activeVaultId)||vaults[0];this.setData({showCompleteDialog:true,vaults,selectedVaultId:preferred.id,completeError:''})}catch(e){wx.hideLoading();wx.showToast({title:e.message||'豆仓读取失败',icon:'none'})}},
  selectCompleteVault(e){if(this.data.completing)return;this.setData({selectedVaultId:e.currentTarget.dataset.id,completeError:''})},
  closeCompleteDialog(){if(!this.data.completing)this.setData({showCompleteDialog:false,completeError:''})},
  stopPropagation(){},
  async confirmComplete(){if(this.data.completing||!this.data.selectedVaultId)return;this.setData({completing:true,completeError:''});try{const result=await api.completePattern(getApp().globalData.activeVaultId,this.data.patternId,this.data.selectedVaultId);this.setData({pattern:result.pattern,showCompleteDialog:false});wx.showToast({title:result.alreadyDeducted?'已完成，无需重复扣除':'已扣库存，作品完成',icon:'success'})}catch(e){this.setData({completeError:e.message||'扣除失败，请检查豆仓库存后重试'})}finally{this.setData({completing:false})}},
  async update(data,message){try{const pattern=await api.updatePattern(getApp().globalData.activeVaultId,this.data.patternId,data);this.setData({pattern});if(data.name)wx.setNavigationBarTitle({title:pattern.name});wx.showToast({title:message,icon:'success'})}catch(e){wx.showToast({title:e.message||'更新失败',icon:'none'})}}
});
