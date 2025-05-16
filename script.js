// 获取数据
async function fetchData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        // 按日期从近到远排序（现在是MM-DD格式）
        return data.sort((a, b) => {
            const [aMonth, aDay] = a.date.split('-').map(Number);
            const [bMonth, bDay] = b.date.split('-').map(Number);
            if (aMonth === bMonth) {
                return bDay - aDay;
            }
            return bMonth - aMonth;
        });
    } catch (error) {
        console.error('Error loading data:', error);
        return [];
    }
}

// 格式化日期
function formatDate(dateString) {
    // 直接返回 MM-DD 格式
    return dateString;
}

// 格式化收益
function formatBenefit(num) {
    return `$${num}`;
}

// 创建表格行
function createTableRow(project) {
    const row = document.createElement('tr');
    row.setAttribute('data-type', project.alphaType);
    
    // 添加月份属性
    const month = project.date.split('-')[0];
    row.setAttribute('data-month', month);
    
    // 使用i18n获取类型文本
    const typeText = window.i18n ? window.i18n.t(project.alphaType) : (project.alphaType === 'airdrop' ? '空投' : '打新');
    const typeClass = project.alphaType === 'airdrop' ? 'airdrop-type' : 'tge-type';
    
    row.innerHTML = `
        <td>${formatDate(project.date)}</td>
        <td>
            <div class="table-project">
                <img src="${project.logo}" alt="${project.project}" class="table-logo">
                ${project.project}
            </div>
        </td>
        <td><span class="table-type ${typeClass}" data-type="${project.alphaType}">${typeText}</span></td>
        <td class="benefit">${formatBenefit(project.benefit)}</td>
    `;
    
    return row;
}

// 创建合计行
function createTotalRow(visibleProjects) {
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    
    // 计算总收益
    const totalBenefit = visibleProjects.reduce((sum, project) => sum + project.benefit, 0);
    
    // 获取当前月份
    const monthBtn = document.querySelector('.month-btn.active');
    const month = monthBtn ? parseInt(monthBtn.getAttribute('data-month')) : 5;
    
    // 获取月份文本
    const monthText = window.i18n ? window.i18n.t(`month.${month}`).replace('月', '') : month;
    
    // 使用带月份的总收益文本
    const totalText = window.i18n ? 
        window.i18n.t('totalWithMonth').replace('{month}', monthText) : 
        `${month}月总收益`;
    
    totalRow.innerHTML = `
        <td colspan="3" class="total-label">${totalText}</td>
        <td class="benefit total-benefit">${formatBenefit(totalBenefit)}</td>
    `;
    
    return totalRow;
}

// 过滤并显示指定月份的数据
function filterByMonth(projects, month) {
    return projects.filter(project => {
        const projectMonth = project.date.split('-')[0];
        return projectMonth === month;
    });
}

// 渲染项目列表
async function renderProjects() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) {
        console.error('Table body element not found');
        return;
    }

    const allProjects = await fetchData();
    if (!allProjects || allProjects.length === 0) {
        console.error('No projects data available');
        return;
    }

    // 默认显示5月的数据
    const visibleProjects = filterByMonth(allProjects, "05");
    
    // 清空现有内容
    tableBody.innerHTML = '';
    
    // 添加项目行
    visibleProjects.forEach(project => {
        tableBody.appendChild(createTableRow(project));
    });
    
    // 添加合计行
    if (visibleProjects.length > 0) {
        tableBody.appendChild(createTotalRow(visibleProjects));
        // 确保更新i18n
        if (window.i18n) {
            window.i18n.updatePageContent();
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 确保先初始化国际化
    if (window.i18n) {
        window.i18n.init();
        console.log('Initialized i18n');
    } else {
        console.error('i18n not found');
    }
    
    // 然后渲染项目列表
    await renderProjects();
    
    // 重新应用国际化（确保动态内容也被翻译）
    if (window.i18n) {
        window.i18n.updatePageContent();
    }
});

// 添加错误处理
window.addEventListener('error', (event) => {
    console.error('Script error:', event.error);
}); 